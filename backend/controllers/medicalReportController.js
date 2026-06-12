import OpenAI from 'openai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import Tesseract from 'tesseract.js';
import MedicalReport from '../models/MedicalReport.js';

function isValidImageBuffer(buffer) {
  if (!buffer || buffer.length < 4) return false;
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return true;
  }
  // JPEG / JPG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return true;
  }
  // WEBP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    return true;
  }
  return false;
}

export const uploadReport = async (req, res) => {
  try {
    console.log('--- Controller: uploadReport ---');
    if (!req.file) {
      console.error('Upload Error: No file in request');
      return res.status(400).json({ message: 'No file uploaded. Please upload a PDF or image report.' });
    }

    console.log('Received file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Validate file type
    const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      console.error('Validation Error: Invalid file type:', req.file.mimetype);
      return res.status(400).json({ message: 'Invalid file format. Only PDF and image files (PNG, JPG, JPEG, WEBP) are supported.' });
    }

    // Validate size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (req.file.size > MAX_SIZE) {
      console.error('Validation Error: File size exceeds 10MB:', req.file.size);
      return res.status(400).json({ message: 'File is too large. Maximum size allowed is 10 MB.' });
    }

    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      try {
        console.log('Parsing PDF directly...');
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text || '';
        console.log(`Direct PDF text extraction returned ${extractedText.length} characters.`);
        
        // If extracted text is less than 30 characters, fall back to OCR
        if (extractedText.trim().length < 30) {
          console.log('PDF has very little selectable text (<30 chars). Treating as scanned PDF and falling back to OCR...');
          const { pdfToPng } = await import('pdf-to-png-converter');
          console.log('Converting PDF pages to PNG buffers...');
          const pngPages = await pdfToPng(req.file.buffer, {
            viewportScale: 2.0
          });
          console.log(`Converted PDF to ${pngPages.length} PNG page(s). Running OCR on pages...`);
          
          let ocrPagesText = [];
          for (let i = 0; i < pngPages.length; i++) {
            console.log(`Running OCR on page ${i + 1}/${pngPages.length}...`);
            const pageOcr = await Tesseract.recognize(pngPages[i].content, 'eng');
            ocrPagesText.push(pageOcr.data.text || '');
          }
          extractedText = ocrPagesText.join('\n');
          console.log(`PDF OCR completed. Extracted ${extractedText.length} characters.`);
        }
      } catch (parseError) {
        console.error('PDF direct parsing error, attempting full OCR fallback:', parseError);
        try {
          const { pdfToPng } = await import('pdf-to-png-converter');
          const pngPages = await pdfToPng(req.file.buffer, {
            viewportScale: 2.0
          });
          let ocrPagesText = [];
          for (let i = 0; i < pngPages.length; i++) {
            const pageOcr = await Tesseract.recognize(pngPages[i].content, 'eng');
            ocrPagesText.push(pageOcr.data.text || '');
          }
          extractedText = ocrPagesText.join('\n');
        } catch (ocrFallbackError) {
          console.error('Full PDF OCR fallback failed:', ocrFallbackError);
          return res.status(400).json({ 
            message: 'Unable to extract text from the PDF report. Please verify the file is not corrupted.' 
          });
        }
      }
    } else {
      // It's an image
      if (!isValidImageBuffer(req.file.buffer)) {
        console.error('Validation Error: Image file has invalid magic numbers / corrupted header');
        return res.status(400).json({ message: 'Image quality is too low for accurate analysis.' });
      }
      try {
        console.log('Running OCR on image...');
        const ocrResult = await Tesseract.recognize(req.file.buffer, 'eng');
        extractedText = ocrResult.data.text || '';
        console.log(`OCR succeeded. Extracted ${extractedText.length} characters.`);
      } catch (ocrError) {
        console.error('Image OCR error:', ocrError);
        return res.status(400).json({
          message: 'Unable to extract text from the image report. Please upload a clearer image.'
        });
      }
    }

    const trimmedText = extractedText.trim();
    
    // Check 1: Length too small
    if (trimmedText.length < 30) {
      console.error('Validation Error: Extracted text length is too small:', trimmedText.length);
      return res.status(400).json({ message: 'Unable to extract sufficient information. Please upload a clearer medical report.' });
    }

    // Check 2: Poor OCR extraction quality (too few letters or words)
    const letterCount = (trimmedText.match(/[a-zA-Z]/g) || []).length;
    const wordCount = trimmedText.split(/\s+/).length;
    if (letterCount < 20 || wordCount < 8) {
      console.error('Validation Error: Poor OCR quality (letters:', letterCount, 'words:', wordCount, ')');
      return res.status(400).json({ message: 'Image quality is too low for accurate analysis.' });
    }

    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    });

    const systemPrompt = `You are a professional medical report analysis assistant.
Analyze the provided document text and determine if it represents a medical report (e.g. blood test, pathology report, diagnostic test, clinical summary, lab result, etc.).

Strictly follow these constraints:
1. If the document is NOT a medical report:
   - Set "isMedicalReport" to false.
   - Determine the most likely documentType from: "Resume", "Educational Document", "Invoice", "General Document".
   - Return only "isMedicalReport" and "documentType" in the JSON (leave other fields as empty arrays or null).

2. If the document IS a medical report:
   - Set "isMedicalReport" to true.
   - Set "documentType" to "Medical Report".
   - Extract and analyze all medical parameters actually present in the text (such as Haemoglobin, WBC, RBC, Platelet Count, Blood Sugar, Fasting Sugar, PP Sugar, HbA1c, Cholesterol, HDL, LDL, Triglycerides, Creatinine, Uric Acid, Vitamin D, Vitamin B12, TSH, T3, T4, ESR, CRP, Blood Pressure, Pulse Rate, Temperature, Oxygen Saturation, Heart Rate, and other commonly found pathology parameters).
   - IMPORTANT: Only analyze values actually extracted from the report. Do NOT generate fake medical data. Never hallucinate parameters. If a parameter is missing, do not invent it.
   - For each parameter, determine its "status" strictly as one of: "Low", "High", "Normal".
   - For each parameter, write a short "explanation" (e.g., "May indicate anaemia" for low Haemoglobin, "Possible hyperglycaemia" for high Blood Sugar, "Within normal range" for normal Cholesterol, "Above normal range, indicates fever" for high Temperature, etc.).
   - In "healthSummary", provide:
     * "detected": List of identified health conditions or abnormalities (e.g. "Mild Anaemia", "Elevated Blood Sugar"). If all values are normal and no abnormalities are found, output exactly ["No significant abnormalities detected."] and do not display "No critical findings summarized."
     * "overallRisk": Overall risk level ("Low", "Moderate", "High").
     * "recommendedAction": Short, direct recommended action (e.g. "Consult physician and monitor blood sugar.").
     * Ensure the total content in "healthSummary" is concise (maximum 4-5 short lines of text in total).
   - In "suggestions", provide short, actionable suggestions based on findings (e.g. "Iron-rich diet", "Reduce sugar intake"). Keep suggestions short.

JSON Response Schema:
{
  "isMedicalReport": boolean,
  "documentType": "Medical Report" | "Resume" | "Educational Document" | "Invoice" | "General Document",
  "healthSummary": {
    "detected": string[],
    "overallRisk": "Low" | "Moderate" | "High",
    "recommendedAction": string
  },
  "parameters": [
    {
      "parameter": string,
      "value": string,
      "status": "Low" | "High" | "Normal",
      "explanation": string
    }
  ],
  "suggestions": string[]
}

Return ONLY valid JSON. Do not include any introductory or concluding text, and do not wrap in markdown block.`;

    const userMessage = `Here is the document text:\n\n${extractedText}`;

    let completion;
    try {
      console.log('Sending request to Groq API using model llama-3.3-70b-versatile...');
      completion = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.1,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });
      console.log('Groq API response received successfully.');
    } catch (apiError) {
      console.error('Groq API Error:', apiError);
      return res.status(500).json({ 
        message: `Failed to communicate with Groq AI API: ${apiError.message || 'Unknown network error.'}` 
      });
    }

    const responseText = completion.choices[0].message.content.trim();
    
    let aiResult;
    try {
      aiResult = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('Failed to parse AI JSON response:', responseText, jsonError);
      try {
        let cleanedText = responseText;
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }
        aiResult = JSON.parse(cleanedText);
      } catch (fallbackError) {
        return res.status(500).json({ 
          message: 'AI response was not in a valid format. Please try again.' 
        });
      }
    }

    // Prepare DB analysis object
    const analysis = {
      isMedicalReport: aiResult.isMedicalReport !== false,
      documentType: aiResult.documentType || (aiResult.isMedicalReport !== false ? 'Medical Report' : 'General Document'),
      healthSummary: aiResult.healthSummary || {
        detected: [],
        overallRisk: 'Low',
        recommendedAction: ''
      },
      abnormalValues: (aiResult.parameters || []).map(val => ({
        parameter: val.parameter || 'Unknown',
        value: val.value || 'N/A',
        status: val.status || 'Normal',
        explanation: val.explanation || ''
      })),
      suggestions: aiResult.suggestions || []
    };

    // If it's classified as a medical report, but no parameters were extracted, return validation error
    if (analysis.isMedicalReport && analysis.abnormalValues.length === 0) {
      console.error('Validation Error: No medical parameters found in report');
      return res.status(400).json({ message: 'No medical parameters detected in the uploaded document.' });
    }

    // Save report
    const medicalReport = await MedicalReport.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      extractedText,
      analysis
    });

    res.status(201).json(medicalReport);
  } catch (error) {
    console.error('Medical report upload/processing error:', error);
    res.status(500).json({ message: 'Internal server error while processing the medical report.' });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await MedicalReport.find({ userId: req.user._id })
      .select('-extractedText') // Exclude heavy extracted text from lists
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Failed to retrieve report history.' });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await MedicalReport.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) {
      return res.status(404).json({ message: 'Medical report not found.' });
    }
    res.json(report);
  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({ message: 'Failed to retrieve medical report.' });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await MedicalReport.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!report) {
      return res.status(404).json({ message: 'Medical report not found.' });
    }
    res.json({ message: 'Medical report deleted successfully.' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Failed to delete medical report.' });
  }
};
