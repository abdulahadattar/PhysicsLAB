# PhysicsLab - Interactive Physics Learning Platform

PhysicsLab is an interactive web application built with Next.js, designed to provide a dynamic and engaging learning experience for Physics students, primarily targeting Grades 9-12. It aligns with the Sindh Textbook Board curriculum but is built with flexibility in mind to potentially adapt to other curricula. The platform offers a rich set of features including interactive simulations, comprehensive study materials, quizzes, an AI-powered learning assistant, and a dedicated dashboard for teachers to manage content and track student progress.

## Getting Started

Follow these steps to set up and run the PhysicsLab project locally for development.

### Prerequisites

Ensure you have the following software installed on your system:

    *   Node.js (latest LTS version recommended)
    *   npm, yarn, or pnpm
    *   Git

### Installation & Setup

1.  **Clone the Repository:**




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
*   **Naming Conventions:** Use clear and descriptive names for variables, functions, and components following standard TypeScript/React conventions (camelCase for variables/functions, PascalCase for components).
*   **Accessibility:** Consider accessibility (ARIA attributes, keyboard navigation) when building or modifying UI components.
*   **Performance:** Be mindful of performance, especially with complex simulations or data fetching.

This project aims to be a comprehensive and accessible learning tool. Your contributions to enhance simulations, add content, improve AI interactions, refine the UI/UX, or improve testing are welcome!

## Projectile Motion G11 Simulation

This simulation allows users to explore projectile motion by defining an initial velocity, angle, and optional forces acting on the projectile. It calculates and displays the trajectory, and if forces are added, visualizes them and their resultant.

### What's NOT YET Implemented

While the core physics calculations and trajectory display work, the following UI and interaction features are planned but not fully wired up:

*   **Visual Display of x and y Components:** The checkboxes "Show Components" and "Show Resultant Force" are UI placeholders; the logic to toggle these visual elements in the SVG isn't fully wired up yet (though the resultant is always shown if forces exist).
*   **Editing Existing Forces Inline:** Currently, forces can only be added or removed.
*   **Drag & Drop Vectors:** This is a more advanced UI feature.
*   **Scaling of SVG Viewport:** The SVG has a fixed viewBox; dynamic scaling to fit all vectors perfectly would be an enhancement.
*   **More Advanced Styling:** Vectors are currently simple lines with arrowheads.

### How it Works (Simplified)

1.  The simulation component (`src/app/(app)/simulations/projectile-motion-g11/page.tsx`) is a client component.
2.  User inputs (initial velocity, angle, forces) are managed via React state.
3.  Physics calculations (trajectory points, force components, resultant force) are performed in TypeScript based on the user inputs.
4.  An SVG element is used to render the trajectory and force vectors. The SVG path and line elements are dynamically generated based on the calculation results.
