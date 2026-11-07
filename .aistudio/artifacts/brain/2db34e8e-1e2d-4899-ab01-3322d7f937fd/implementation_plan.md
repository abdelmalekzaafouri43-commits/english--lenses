# English Lenses Implementation Plan

English Lenses is a premium AI-powered educational video studio application. This project delivers a sophisticated, responsive dashboard for video project creation, featuring an AI Lesson Creator, project management, and a premium, cinematic user interface.

## User Review & Critical Decisions

> [!IMPORTANT] 
> This plan assumes the following defaults based on the user's request for a "professional" and "premium" experience:
> - **Navigation**: Navigation Rail (sidebar) for tablet/desktop ergonomics.
> - **Persistence**: Firebase Firestore for durable, multi-device project sync and authentication.
> - **AI Logic**: Firebase AI (`gemini-3.8-flash`) for content generation.
> - **Authentication**: Google Sign-In via Jetpack Credential Manager.

- **Confirmed Decision 1**: Premium dark-theme cinematic design system using Material 3.
- **Confirmed Decision 2**: Firestore for reliable project storage and authentication.
- **Confirmed Decision 3**: Navigation Rail for professional desktop/tablet workspace layout.

## 1. Overview & Core Concept

- **What It Does**: An all-in-one studio interface for teachers to create educational video lessons using AI, with tools for storyboard editing, animation, and project management.
- **Target Audience**: Educators, instructional designers, and content creators.
- **Key Value**: Dramatically reduces the time and effort required to produce professional, structured educational video content.

## 2. User Experience & Visual Design

- **Key User Flows**: 
    1. **Authentication**: Google Sign-In gate.
    2. **Dashboard**: Access recent projects and core studio tools.
    3. **AI Lesson Creator**: Input lesson parameters, generate a structured script/storyboard, and save as a project.
    4. **Project Management**: List, open, rename, and delete projects.
- **Visual Identity & Theme**:
    - *Aesthetic Direction*: Premium, minimalist, cinematic dark theme.
    - *Color Palette & Mood*: Deep slate background (`#0F111A`), electric purple/blue accents (`#6C63FF`, `#2196F3`), and crisp typography.
    - *Typography & Hierarchy*: Sans-serif display fonts (e.g., Inter/Roboto) with high contrast weight for headings and clear readability for body text.
    - *Component Styling*: Material 3 with tonal elevation (cards for project items, modals for AI inputs), smooth ripple effects, and refined padding/spacing (48dp+ interactive targets).
- **Interactive Feedback**: Spring-based motion transitions (<300ms), clear loading states for AI operations, and success/error toasts for project actions.

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Firestore vs. LocalStorage**
    - *Chosen Approach*: Firestore.
    - *Why*: Enables "professional" multi-device access, prevents data loss, and supports sharing/collaboration.
    - *Alternatives Considered*: localStorage (rejected, unreliable for production studio work).
- **Decision 2: Navigation**
    - *Chosen Approach*: Navigation Rail (sidebar).
    - *Why*: Optimal for wide-screen professional tool layouts, avoids bottom navigation truncation/ergonomics issues on desktop.
    - *Alternatives Considered*: Hamburger drawer (rejected, hides navigation).

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────┐
│                  Authentication (Auth)       │
│                  (Google Sign-In)            │
└───────────────────────┬──────────────────────┘
                        │
┌───────────────────────┴──────────────────────┐
│                   AppContent (State)         │
│  (Navigation Rail + Screen Content Router)   │
└──────────────┬────────────────────────┬──────┘
               │                        │
┌──────────────┴──────┐      ┌──────────┴──────────┐
│      ViewModels      │      │     Repositories    │
│ (AI, Lesson, Projects)│      │  (Firestore + AI)   │
└──────────────┬──────┘      └──────────┬──────────┘
               │                        │
┌──────────────┴────────────────────────┴──────┐
│           Firebase Services                  │
│  (Firestore DB + Gemini AI Logic)            │
└──────────────────────────────────────────────┘
```

- **Data Model**: `User` -> `Projects` (collection) -> `Scenes` (subcollection).
- **State Management**: MVVM using `ViewModel`, `StateFlow`, and `collectAsStateWithLifecycle` for Android; Modular ES6 (`StudioState`, `NavigationRouter`) with `localStorage` and Firestore synchronization hooks for the Web Studio.
- **Integration**: Firebase AI (`generativeModel("gemini-3.8-flash")`) for content generation with structured JSON schema responses. Firestore rules for user-based data isolation.

## 5. Development Progress

- [x] **Phase 1: Backend & Firebase Setup**
  - Provisioned Firebase Firestore & AI Logic.
  - Deployed `firestore.rules` and generated `firebase-blueprint.json`.
  - Configured `AppCheckHelper.kt` and initialized App Check in `MainActivity.kt`.
- [x] **Phase 2: Data Models & Persistence Layer**
  - Built `Project.kt` and `ProjectsRepository.kt` with full CRUD, demo templates, and reactive flows.
  - Verified with JUnit 4 suite (`StudioUnitTest.kt`) — all tests passed.
- [x] **Phase 3: Responsive Studio Dashboard UI**
  - Left-docked responsive sidebar navigation (always on the left).
  - 6 full suites implemented: Dashboard, Lesson Generator, Worksheet Generator, Quiz Generator, Video Studio, My Projects.
  - Interactive playback, timeline scrubber, scene reordering/editing/duplicating/deleting, printable worksheets, and quizzes.
  - Verified with Gradle compilation (`compile_applet` BUILD SUCCESSFUL).
- [ ] **Phase 4: Direct Cloud & Gemini Multi-Modal Verification**
  - Run end-to-end multi-modal script polish and cloud sync drills.
  - Prepare for production export and distribution.

