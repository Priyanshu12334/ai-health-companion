# Aurora AI Health Companion

AI-powered health tracking and medical report simplification web application built using the MERN Stack and Groq AI.

## Project Overview

Aurora AI Health Companion is a comprehensive personal wellness dashboard that helps users track their key health indicators like hydration levels, sleep patterns, and daily mood states. In addition to proactive tracking, Aurora features an AI Health Assistant for instant conversations and a **Medical Report Simplifier** which allows users to upload clinical PDFs, extracts the text on-the-fly, and generates simple patient-friendly summaries using advanced LLMs via the Groq API.

## Features

* **User Authentication**: Secure JWT-based signup, login, and protected route access.
* **Medical Report Simplifier**: Upload PDF medical reports (up to 10 MB) to get key findings, an abnormal values table, and practical wellness suggestions.
* **AI Health Assistant**: Chat with Aurora, an AI health companion trained to offer concise, context-aware suggestions based on your logged metrics.
* **Hydration Tracking**: Log daily water intake against customized goals.
* **Sleep Tracking**: Record bedtime, wakeup time, and sleep quality badges.
* **Mood Tracking**: Log your daily emotional state and visualize mood patterns.
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

*(Screenshots of the Aurora AI Health Companion dashboard, AI Chat, and Medical Report Simplifier will be added here)*

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

## Future Enhancements

* **Image Uploads & OCR**: Add support for scanning paper reports via device camera/image files using native OCR models.
* **Trend Analysis**: Monitor metrics across multiple consecutive reports to draw health trend charts.
* **Multi-language Support**: Translate simplified medical summaries into regional languages.

## Author

Priyanshu Suyal
