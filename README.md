# PhysicsLab by Sir Abdul Ahad

This is an interactive Next.js web application designed for learning Physics, primarily for Grades 9-12, aligned with the Sindh Textbook Board curriculum. It features simulations, study materials, quizzes, AI-powered assistance, and teacher management tools.

## Getting Started

To get started with development:

1.  **Prerequisites:**
    *   Node.js (latest LTS version recommended)
    *   npm, yarn, or pnpm

2.  **Environment Variables:**
    *   Create a `.env.local` file in the root of the project.
    *   Copy the contents of `.env` (if it exists, or see variables below) into `.env.local`.
    *   **Firebase Setup (Crucial for Login & some AI features):**
        *   Create a Firebase project at [firebase.google.com](https://firebase.google.com/).
        *   Enable Firebase Authentication (Sign-in method: Google).
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
        *   `NEXT_PUBLIC_TEACHER_EMAIL=your_teacher_google_email@example.com` (Set this to the Google email that should be recognized as the teacher).
    *   **Offline Debug Login (Optional, for testing without Firebase):**
        *   `NEXT_PUBLIC_DEBUG_TEACHER_CREDENTIALS='[{"user":"debug_user","pass":"debug_pass"}]'` (JSON string array of user/pass objects).
    *   **App URL (for API calls during build):**
        *   `NEXT_PUBLIC_APP_URL=http://localhost:9002` (Adjust port if needed).

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
    ```
    Or, if you want it to watch for changes in AI flow files:
    ```bash
    npm run genkit:watch
    ```

## Project Structure & Contribution Notes

This project uses Next.js with the App Router. Here's a brief overview of key directories:

*   **`src/app/(app)/`**: Contains the main application pages and layouts visible to logged-in users or guests.
    *   Each subdirectory often represents a feature (e.g., `simulations`, `study-material`, `teacher-dashboard`).
    *   `page.tsx` files define the UI for routes.
    *   `layout.tsx` files define shared layouts for segments.
*   **`src/app/api/`**: Backend API routes handled by Next.js.
    *   Example: `study-materials/route.ts` serves data for the study materials section.
*   **`src/components/`**: Reusable React components.
    *   `layout/`: Components related to the overall page structure (e.g., `app-shell.tsx`).
    *   `ui/`: ShadCN UI primitive components (Button, Card, etc.). These are generally well-documented by ShadCN.
    *   Feature-specific components (e.g., `study/`, `mind-maps/`).
*   **`src/lib/`**: Shared utilities, constants, and type definitions.
    *   `constants.ts`: Defines navigation items, simulation topics, app metadata, etc.
    *   `types.ts`: Core TypeScript interfaces for data structures.
    *   `firebase.ts`: Firebase SDK initialization.
    *   `utils.ts`: Utility functions like `cn` for class names.
*   **`src/hooks/`**: Custom React hooks for shared client-side logic (e.g., `useUserSession`, `useToast`).
*   **`src/ai/`**: Genkit AI integration.
    *   `genkit.ts`: Initializes Genkit and configures the AI model.
    *   `flows/`: Contains the individual Genkit flow files that define specific AI functionalities (e.g., `aiLearningAssistantFlow.ts`, `generateMindMapFlow.ts`). Each flow typically defines its input/output schemas (using Zod) and the prompt for the AI model.
*   **`src/data/`**: Static JSON data files used as a primary source for some content (e.g., `study-materials.json`). These are designed to be editable for content updates.
*   **`public/`**: Static assets like icons, manifest files, and the service worker (`sw.js`).

**Contribution Guidelines (General):**

*   **Understand the Flow:** For UI changes, trace how data flows from `page.tsx` components (often fetching data or using context) to the presentational components. For AI features, look at the relevant flow in `src/ai/flows/` and how it's called from the client.
*   **Types:** Adhere to TypeScript. Use types defined in `src/lib/types.ts` where applicable.
*   **Styling:** Use Tailwind CSS utility classes. For new larger components, consider if a ShadCN primitive can be adapted.
*   **Offline First:** Many features aim for offline functionality. Consider how new features will behave without an internet connection (e.g., caching, local storage, graceful degradation).
*   **Teacher vs. Student View:** The app uses `UserSessionContext` to simulate different user roles. Teacher-specific UI and routes are conditionally rendered.
*   **Simulations:** Are self-contained client components, often using Canvas API or SVG for visuals. Physics logic is in TypeScript within the component.
*   **Code Comments:** Please add comments to explain complex logic or non-obvious decisions. JSDoc for functions/components is encouraged.
*   **Testing (Manual for now):** Test your changes across different features and simulated offline/online states.

This project aims to be a comprehensive learning tool. Your contributions to enhance simulations, add content, improve AI interactions, or refine the UI/UX are welcome!
