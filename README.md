# Aurora AI Health Companion

AI-powered health tracking and medical report simplification web application built using the MERN Stack and Groq AI.

## Project Overview

Aurora AI Health Companion is a comprehensive personal wellness dashboard that helps users track their key health indicators like hydration levels, sleep patterns, and daily mood states. It features a local **Health Score** calculator that aggregates sleep, hydration, and mood metrics into a single, intuitive dashboard score. In addition to proactive tracking, Aurora features an AI Health Assistant for instant conversations and a **Medical Report Simplifier** which allows users to upload clinical PDF or Image, extracts the text on-the-fly, and generates simple patient-friendly summaries using advanced LLMs via the Groq API.

## Features

* **User Authentication**: Secure JWT-based signup, login, and protected route access.
* **Medical Report Simplifier**:
  * **PDF Support**: Direct text extraction from selectable PDFs.
  * **Image & Scanned PDF OCR Support**: OCR text extraction from scanned PDFs, JPG, JPEG, PNG, and WEBP formats using Tesseract.js.
  * **AI Health Analysis**: Clinical term translation into easy-to-understand summaries.
  * **Disease Detection**: Intelligent summaries of detected conditions (e.g. Fever, Diabetes, Anaemia).
  * **Parameter Extraction**: Identification of 26+ parameters (Haemoglobin, WBC, RBC, Glucose, Cholesterol, Creatinine, etc.) with status indicators (Low, High, Normal).
  * **Smart Suggestions**: Short, actionable lifestyle and diet suggestions based on report findings.
  * **Document Classification**: Automatic detection of non-medical documents (e.g., Resumes, Invoices) to prevent invalid analyses.
* **AI Health Assistant**: Chat with Aurora, an AI health companion trained to offer concise, context-aware suggestions based on your logged metrics.
* **Hydration Tracking**: Log daily water intake against customized goals.
* **Sleep Tracking**: Record bedtime, wakeup time, and sleep quality badges.
* **Mood Tracking**: Log your daily emotional state and visualize mood patterns.
* **Health Score**: A client-side, real-time health score (0-100) calculated from daily sleep (40 pts), hydration (30 pts), and mood (30 pts) data, featuring a dynamic SVG progress ring, status indicator, and personalized insights.
* **Analytics Dashboard**: Comprehensive summaries and achievements badges indicating goals achieved.
* **Responsive Design**: Elegant sidebar and bottom navigation layout built for desktop, tablet, and mobile screens.

## Tech Stack

* **React.js**
* **Node.js**
* **Express.js**
* **MongoDB**
* **JWT Authentication**
* **REST APIs**
* **Groq API**
* **PDF Processing**
* **OCR/Text Extraction**
* **Tailwind CSS**
* **Vercel**
* **Render**

## Screenshots

*(Screenshots of the Aurora AI Health Companion dashboard (featuring the Health Score card), AI Chat, and Medical Report Simplifier will be added here)*

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd ai-health-companion
```

### Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### Run Project

```bash
# Backend
npm run dev

# Frontend
npm run dev
```

## Environment Variables

Create a `.env` file in the backend folder:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

## Medical Report Simplifier Workflow

```
File Upload (PDF, PNG, JPG, JPEG, WEBP)
  │
  ├──► Direct PDF Text Extraction (for selectable PDFs)
  │
  └──► Automatic OCR Fallback (for scanned PDFs & medical images using Tesseract.js)
        │
        ▼
Extracted Text Validation (Checks text length & quality)
  │
  ▼
AI-Powered Document Classification (Verifies if it's a valid medical report)
  │
  ├──► [Invalid] ⚠️ Non-medical report warning & Type detection (Resume, Invoice, etc.)
  │
  └──► [Valid] Extract Parameters, Diagnose Conditions, & Generate Explanations
        │
        ▼
Structured JSON Result
  │
  ▼
Interactive Patient Dashboard (Health Summary, Color-coded Table, Smart Suggestions)
```

## Future Enhancements

* **Trend Analysis**: Monitor metrics across multiple consecutive reports to draw health trend charts.
* **Multi-language Support**: Translate simplified medical summaries into regional languages.

## Author

Priyanshu Suyal
