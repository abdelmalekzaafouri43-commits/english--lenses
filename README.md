# ENGLISH LENSES – AI-Powered Educational Video Studio

ENGLISH LENSES is a professional educational platform and studio that transforms curriculum concepts into interactive 3D video lessons, pedagogical worksheets, quizzes, and reading passages powered by **Gemini AI** and synchronized with **Firebase Firestore**.

---

## Architecture & Features

1. **Secure Gemini AI Backend (`server.js`)**:
   - Node.js backend proxy running on port 3000.
   - Encapsulates `GEMINI_API_KEY` server-side, ensuring API keys are never exposed in frontend browser JavaScript.
   - Powers 5 core generators:
     - English Lesson Generator (3-scene pedagogical storyboards)
     - Worksheet Generator (vocabulary matching, cloze drills, and scenario analysis)
     - Quiz & Assessment Generator (multiple-choice evaluation with explanations)
     - Educational Video Script Coach (narration rewriting and 3D camera staging)
     - School Topic & Reading Text Generator (CEFR-graded reading passages)

2. **Firebase Firestore Persistence & Auth**:
   - Real-time cloud synchronization for projects, lesson scenes, and generated worksheets.
   - Zero-trust security rules and credential manager integration.

3. **Android Application (Kotlin & Jetpack Compose)**:
   - Native mobile companion application built with Material Design 3 and MVVM architecture.
   - Fully tested with local Robolectric unit test suite.

---

## Setup & Local Development

### Prerequisites
- Node.js (v18+)
- Android Studio / Gradle 9+ (for Android app compilation)

### 1. Configure Secrets
Never commit `.env` containing your actual API keys. Use `.env.example` as a template:
```properties
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 2. Run the Web Studio & Secure Backend
```bash
npm install
npm start
```
Open `http://localhost:3000` in your browser.

### 3. Run Android Application
Open the project root in Android Studio or compile via Gradle:
```bash
gradle :app:assembleDebug
```

---

## Deployment Instructions

1. **Web Deployment**: Deploy `server.js`, `index.html`, `script.js`, and `style.css` to any Node.js hosting platform (e.g., Google Cloud Run, Heroku, Render). Set `GEMINI_API_KEY` in your production environment variables.
2. **Firebase Setup**: Deploy Firestore security rules using Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. **Android Export**: Generate release APK/AAB via Android Studio or Gradle signing configurations.
