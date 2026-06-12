import OpenAI from 'openai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import Tesseract from 'tesseract.js';
import MedicalReport from '../models/MedicalReport.js';

export const uploadReport = async (req, res) => {
  try {
    console.log('--- Controller: uploadReport ---');
    if (!req.file) {
      console.error('Upload Error: No file in request');
      return res.status(400).json({ message: 'No file uploaded. Please upload a PDF report.' });
    }

    console.log('Received file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Validate file type
    const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      console.error('Validation Error: Invalid file type:', req.file.mimetype);
      return res.status(400).json({ message: 'Invalid file format. Only PDF and image files (PNG, JPG, JPEG) are supported.' });
    }

    // Validate size (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (req.file.size > MAX_SIZE) {
      console.error('Validation Error: File size exceeds 10MB:', req.file.size);
      return res.status(400).json({ message: 'File is too large. Maximum size allowed is 10 MB.' });
    }

    let extractedText = '';
    if (req.file.mimetype === 'application/pdf') {
      let parser;
      try {
        console.log('Parsing PDF...');
        parser = new PDFParse({ data: req.file.buffer });
        const pdfData = await parser.getText();
        extractedText = pdfData.text || '';
        console.log(`PDF parse succeeded. Extracted ${extractedText.length} characters.`);
      } catch (parseError) {
        console.error('PDF text extraction error:', parseError);
        return res.status(400).json({ 
          message: `OCR / Text extraction failed: ${parseError.message || 'The PDF might be corrupted or in an unsupported format.'}` 
        });
      } finally {
        if (parser && typeof parser.destroy === 'function') {
          try {
            await parser.destroy();
          } catch (destroyError) {
            console.error('Error destroying parser:', destroyError);
          }
        }
      }
    } else {
      try {
        console.log('Running OCR on image...');
        const ocrResult = await Tesseract.recognize(req.file.buffer, 'eng');
        extractedText = ocrResult.data.text || '';
        console.log(`OCR succeeded. Extracted ${extractedText.length} characters.`);
      } catch (ocrError) {
        console.error('Image OCR error:', ocrError);
        return res.status(400).json({
          message: `OCR / Text extraction failed: ${ocrError.message || 'Failed to extract text from the image.'}`
        });
      }
    }

    if (!extractedText.trim()) {
      console.error('Validation Error: Extracted text is empty');
      return res.status(400).json({ 
        message: 'Could not extract any readable text from this report. Please make sure the report has clear readable text.' 
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    });

    const systemPrompt = `You are a medical report simplification assistant.
Analyze the provided medical report text and return a simplified summary strictly in JSON format.

JSON schema:
{
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
  "abnormalValues": [
    {
      "parameter": "Parameter Name",
      "value": "Value (e.g. 240 mg/dL)",
      "status": "High/Low/Abnormal"
    }
  ],
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}

Constraints:
1. Return MAXIMUM 3 key findings.
2. Return MAXIMUM 3 abnormal parameters in "abnormalValues". If there are none, return an empty array.
3. Return MAXIMUM 2 practical suggestions.
4. Keep the language extremely simple, patient-friendly, and easy to understand.
5. Keep the total content across all fields short (total under 100 words).
6. Ignore normal values unless they are critically important to highlight.
7. Return ONLY valid JSON. Do not include any introductory or concluding text, and do not wrap in markdown block.`;

    const userMessage = `Here is the medical report text:\n\n${extractedText}`;

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
    
    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('Failed to parse AI JSON response:', responseText, jsonError);
      // Fallback parsing or clean up tags and try again
      try {
        let cleanedText = responseText;
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }
        analysis = JSON.parse(cleanedText);
      } catch (fallbackError) {
        return res.status(500).json({ 
          message: 'AI response was not in a valid format. Please try again.' 
        });
      }
    }

    // Double check constraints on findings/abnormalValues/suggestions
    if (!analysis.keyFindings || !Array.isArray(analysis.keyFindings)) {
      analysis.keyFindings = [];
    } else {
      analysis.keyFindings = analysis.keyFindings.slice(0, 3);
    }

    if (!analysis.abnormalValues || !Array.isArray(analysis.abnormalValues)) {
      analysis.abnormalValues = [];
    } else {
      analysis.abnormalValues = analysis.abnormalValues.slice(0, 3).map(val => ({
        parameter: val.parameter || 'Unknown',
        value: val.value || 'N/A',
        status: val.status || 'Abnormal'
      }));
    }

    if (!analysis.suggestions || !Array.isArray(analysis.suggestions)) {
      analysis.suggestions = [];
    } else {
      analysis.suggestions = analysis.suggestions.slice(0, 2);
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
