# PhysicsLab: Your Interactive Universe for Mastering Physics

# ![Build Status](placeholder_url) ![License](placeholder_url)

*   🔬 **Interactive Simulations:** Hands-on virtual labs and visualizations covering core physics concepts to enhance understanding through experimentation.
*   📚 **Comprehensive Study Materials:** Organized, chapter-wise notes, examples, MCQs, and exercises tailored for specific grades.
*   🧠 **AI Learning Assistant:** A context-aware AI powered by Google Gemini Flash that provides personalized help, explains concepts, analyzes diagrams, and assists with problem-solving.
*   📝 **Quizzes & Self-Assessment:** Practice quizzes to test knowledge, track performance, and identify areas needing more focus.
*   📊 **Teacher Dashboard:** A dedicated portal for educators to manage study content, create assignments, view analytics (with future backend integration), and potentially manage student accounts.
*   📱 **Offline-First PWA:** Access cached study materials and core features even without an internet connection.
*   🌐 **Physics Timeline & Resources:** Explore the history of physics and discover key research centers, universities, and philosophical connections.
*   🔗 **Mind Maps:** Visualize and explore connections between physics concepts.

## 🛠️ Technologies Used
*   **Framework:** Next.js 15+ (App Router)
*   **Language:** TypeScript
*   **UI:** React 18+, Shadcn UI, Tailwind CSS
*   **AI Integration:** Genkit with Google Gemini 2.0 Flash
*   **Backend:** Firebase (Authentication, Firestore, Storage - currently in development/integration)
*   **Offline Capabilities:** PWA (manifest.json, sw.js), localStorage, IndexedDB
*   **Utilities:** Zod (for schema validation), ReactFlow (for mind maps)

## 🚀 Getting Started

Follow these steps to set up and run the PhysicsLab project locally for development and contribution.

### Prerequisites

Ensure you have the following software installed on your system:
*   Node.js (latest LTS version recommended)
*   npm, yarn, or pnpm
*   Git
*   A Google Cloud Project with the Gemini API enabled (for AI features)
*   A Firebase Project (for Authentication and future backend features)

### Installation

1.  **Clone the Repository:**


*   **Framework:** Next.js 15+ (App Router)
*   **Language:** TypeScript
*   **UI:** React 18+, ShadCN UI, Tailwind CSS
*   **AI Integration:** Genkit with Google Gemini 2.0 Flash
*   **Backend:** Firebase (Authentication, Firestore, Storage - currently in development)
*   **Offline Capabilities:** PWA (manifest.json, sw.js), localStorage, IndexedDB
*   **Utilities:** Zod (for schema validation), ReactFlow (for mind maps)

## 🚀 Getting Started

Follow these steps to set up and run the PhysicsLab project locally for development and contribution.

### Prerequisites

Ensure you have the following software installed on your system:
*   Node.js (latest LTS version recommended)
*   npm, yarn, or pnpm
*   Git
*   A Google Cloud Project with the Gemini API enabled (for AI features)
*   A Firebase Project (for Authentication and future backend features)

### 📝 Environment Variables

Create a `.env.local` file in the root of your project by copying the `.env` file. Populate the following variables:

*   **Firebase Setup (Crucial for Login & some AI features):** Obtain these from your Firebase project settings > Web App configuration.


### Installation & Setup

1.  **Clone the Repository:**
    ```bash
    # Replace with your repository URL
    git clone https://your-repository-url/physicslab.git
    cd physicslab
    ```

2.  **Environment Variables:**
    *   Create a `.env.local` file in the root of the project by copying `.env`.
    *   **Firebase Setup (Crucial for Login & some AI features):**
        *   Create a Firebase project at [firebase.google.com](https://firebase.google.com/).
        *   Enable Firebase Authentication (Sign-in method: Google).
        *   Enable Firestore Database (for user role detection - start in test mode, then secure rules).
        *   In your Firebase project settings, find your web app's Firebase SDK configuration snippet.
        *   Populate the following variables in `.env.local` with your Firebase project credentials:
            ```
            NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
            NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
            NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
            NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
            NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
            ```
    *   **Teacher Identification:**
        *   `NEXT_PUBLIC_TEACHER_EMAIL=your_teacher_google_email@example.com` (Set this to the Google email that should be recognized as the primary teacher).
    *   **Offline Debug Login (Optional, for testing without Firebase/internet):**
        *   `NEXT_PUBLIC_DEBUG_TEACHER_CREDENTIALS='[{"user":"debug_user","pass":"debug_pass"}]'` (JSON string array of user/pass objects).
    *   **App URL (for API calls during build):**
        *   `NEXT_PUBLIC_APP_URL=http://localhost:9002` (Adjust port if needed for your dev environment).

3.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    The application should now be running, typically on `http://localhost:9002`.

5.  **Run Genkit Dev Server (for AI features):**
    In a separate terminal:
    ```bash
    npm run genkit:dev
    # or, to watch for changes in AI flow files:
    npm run genkit:watch
    ```

## Project Structure & Contribution Notes

This project uses Next.js with the App Router. Here's a brief overview of key directories to help contributors:

*   **`src/app/(app)/`**: Contains the main application pages and layouts visible to users.
    *   Each subdirectory often represents a feature (e.g., `simulations`, `study-material`, `teacher-dashboard`).
    *   `page.tsx` files define the UI for routes (often Server Components fetching initial data or Client Components for interactivity).
    *   `layout.tsx` files define shared layouts for segments.
*   **`src/app/api/`**: Backend API routes handled by Next.js (e.g., `/api/study-materials` serving static JSON).
*   **`src/components/`**: Reusable React components.
    *   `layout/`: Components related to the overall page structure (e.g., `app-shell.tsx`).
    *   `ui/`: ShadCN UI primitive components (Button, Card, etc.). These are generally well-documented by ShadCN.
    *   Feature-specific components (e.g., `study/chapter-detail-client.tsx`, `mind-maps/visual-mind-map.tsx`).
*   **`src/lib/`**: Shared utilities, constants, and type definitions.
    *   `constants.ts`: Defines navigation items (`NAV_ITEMS`), simulation topics (`SIMULATION_TOPICS`), quiz topics (`QUIZ_TOPICS`), app metadata, etc. This is a key file for adding new sections or simulations to the UI.
    *   `types.ts`: Core TypeScript interfaces for data structures (`StudyGrade`, `Chapter`, `Assignment`, `SimulationTopic`, etc.).
    *   `firebase.ts`: Firebase SDK initialization and configuration.
    *   `utils.ts`: Utility functions like `cn` for class names.
*   **`src/contexts/`**: React Context providers.
    *   `user-session-context.tsx`: Manages user authentication state (Firebase & simulated), user roles, and "View as Student" mode for teachers.
*   **`src/hooks/`**: Custom React hooks for shared client-side logic (e.g., `useUserSession`, `useToast`, `useIsMobile`).
*   **`src/ai/`**: Genkit AI integration.
    *   `genkit.ts`: Initializes Genkit and configures the AI model (Gemini Flash).
    *   `flows/`: Contains individual Genkit flow files (`.ts`) that define specific AI functionalities (e.g., `aiLearningAssistantFlow.ts`, `generateMindMapFlow.ts`). Each flow typically defines its input/output schemas (using Zod) and the prompt for the AI model.
*   **`src/data/`**: Static JSON data files used as a primary source for some content.
    *   `study-materials.json`: Defines the structure of grades and chapters, including base PDF links and placeholder content. Teachers can override this locally using the "Content Management" tool, but permanent changes require updating this file in the codebase.
    *   `mind-map-data.json`: Stores pre-generated mind map structures.
    *   Other JSON files for philosophical questions, research centers, universities, lab equipment.
*   **`public/`**: Static assets like icons, `manifest.json`, and the service worker (`sw.js`).

**Current State & Contribution Focus:**

*   **Implemented Features:** The app has a wide range of features in various states of completion, from fully interactive simulations (e.g., Logic Gates, Density Lab, Motion Graphing) to detailed placeholders for advanced simulations and content sections. Core systems like user session simulation, dynamic study material display, and AI-assisted tools (Learn with AI, Mind Maps, Lesson Planner) are functional.
*   **Teacher Dashboard:** Provides client-side tools for content management, assignment creation, and analytics, with data stored in the teacher's `localStorage`. This allows for in-app content editing by the teacher, which then needs to be manually transferred to the project's `src/data/` files for global updates.
*   **Offline Capabilities:** The app aims to be a PWA. `localStorage` and `IndexedDB` are used for caching various data types (settings, feedback, mind maps, study material lists, chapter PDFs). A basic service worker handles asset caching.
*   **Areas for Contribution (High Priority):**
    1.  **Implementing Interactivity for Placeholder Simulations:** This is the largest area. Each placeholder page in `src/app/(app)/simulations/` details the required features.
    2.  **Populating Content in JSON Files:** Adding detailed notes, MCQs, ERQs, CRQs, real-world examples, YouTube links, etc., to `study-materials.json` for all grades and chapters. Completing data for `philosophical-questions.json`, `research-centers.json`, etc.
    3.  **Developing a Dynamic Quiz System:** Moving beyond static questions to a full question bank and result tracking system.
    4.  **Enhancing PWA & Offline Features:** Improving the service worker for more comprehensive caching (especially all linked PDFs when "Download All for Grade" is triggered from Settings) and robust background sync.

**General Contribution Guidelines:**

*   **Understand the Flow:** For UI changes, trace data from page/layout components to presentational components. For AI, review the relevant flow in `src/ai/flows/` and its client-side invocation.
*   **Types:** Adhere to TypeScript. Use or extend types defined in `src/lib/types.ts`.
*   **Styling:** Use Tailwind CSS utility classes. Adapt ShadCN primitives where possible.
*   **Offline First:** Consider how new features or changes will behave offline. Aim for graceful degradation or local data persistence.
*   **Teacher vs. Student View:** Use `UserSessionContext` for role-based rendering.
*   **Code Comments:** Add JSDoc comments for functions/components and inline comments for complex logic.
*   **Testing:** Manually test changes across features and simulated offline/online states.
*   **Naming Conventions:** Follow standard TypeScript/React conventions.
*   **Accessibility (A11y):** Consider ARIA attributes and keyboard navigation.
*   **Performance:** Be mindful of performance, especially for simulations and data-heavy components.

This project aims to be a comprehensive and accessible learning tool. Your contributions to enhance simulations, add content, improve AI interactions, refine the UI/UX, or bolster offline capabilities are highly welcome! Please refer to the `CHANGELOG.md` for recent developments.

# Educational App: Study Material Management

## Overview
This app allows teachers to manage study materials, including dynamic PDF resources, key points, exercises, and more for each grade and chapter. The system is modular, future-proof, and designed for easy collaboration and extension.

## Features
- **Modular PDF Resource Management:**
  - Teachers can add, label, and manage any type of PDF (uploaded or linked) for any grade/chapter.
  - Flexible support for both uploaded files and external links.
  - No hardcoded or legacy PDF fields—everything is managed via a `pdfResources` array in each chapter's content.
- **User-Friendly Dashboard:**
  - Intuitive UI for adding, editing, and removing PDF resources.
  - File upload and external link support.
  - Label and icon selection for each PDF resource.
- **Content Editing:**
  - Key points, summaries, formulas, real-world examples, and diagram descriptions can be managed for each chapter.
- **Local Storage Drafts:**
  - Changes are saved to the browser's local storage for review before updating the main data file.

## Data Model
- All PDF resources are stored in a `pdfResources` array within each chapter's content in `study-materials.json`.
- Each resource includes a label, icon, and URL (either uploaded or external).

## How to Update Study Materials
1. Use the teacher dashboard to manage content and PDF resources.
2. When ready, copy the updated data from local storage and update `src/data/study-materials.json` in the project code.

## Contributing
- Code is modular and readable for easy collaboration.
- All legacy/hardcoded PDF fields and AI-generated hints have been removed.
- Please follow best practices for maintainability and extensibility.

## Getting Started
1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Access the teacher dashboard to manage study materials.

## File Structure
- `src/data/study-materials.json`: Main data file for grades, chapters, and resources.
- `src/app/(app)/teacher-dashboard/content-management/page.tsx`: Main UI for content management.
- `src/lib/types.ts`: Type definitions for grades, chapters, and PDF resources.

## License
MIT
