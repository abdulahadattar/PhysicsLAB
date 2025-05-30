# Quizzes Developer Guide

This document provides a developer's guide to the PhysicsLab quiz system. It outlines the architecture, data flow, and how to extend or modify existing functionalities.

## Architecture Overview

The quiz system follows a client-server architecture using Next.js App Router.
-   **Frontend:** React components (TypeScript/JSX) handle user interaction, displaying quizzes, managing quiz taking, and showing results. Shadcn UI is used for styling and UI components.
-   **Backend:** Next.js API routes handle server-side logic, including fetching quizzes and questions, submitting attempts, server-side scoring, and teacher-specific management operations. Firestore is used as the database for storing quiz data and attempts.
-   **Database:** Firestore stores all quiz-related data.

## Data Flow

1.  **Viewing Quizzes:**
    *   The `src/app/(app)/quizzes/page.tsx` component fetches a list of available quizzes from the `/api/quizzes` API route (or directly from Firestore, although an API layer is preferred for potential future logic).
    *   It also fetches the user's quiz attempts to show completion status and best scores.
    *   Quizzes are displayed using `Card` components.
2.  **Taking a Quiz:**
    *   Navigating to `src/app/(app)/quizzes/[quizId]/page.tsx` triggers fetching the specific quiz details and its associated questions from Firestore (potentially via a dedicated API route like `/api/quizzes/[quizId]/questions`).
    *   The page component manages the current question displayed and the user's selected answers in local state.
    *   Modular components (`QuestionDisplay`, `QuizTimer`, `QuizNavigation`) handle rendering individual questions, managing the timer, and providing navigation.
    *   Upon submission, the user's answers and the `quizId` are sent to the `/api/quizzes/submitAttempt` API route via a POST request.
3.  **Quiz Submission and Scoring:**
    *   The `/api/quizzes/submitAttempt` API route receives the submission data.
    *   It fetches the correct answers for all questions in the submitted quiz from Firestore.
    *   Server-side scoring is performed by comparing the submitted answers with the correct answers.
    *   A new document is created in the `quizAttempts` Firestore collection, recording the user's ID, quiz details, score, maximum score, answers given (with correctness flags), start time, and completion time.
    *   The API returns the `attemptId`, score, and maximum score to the frontend.
4.  **Viewing Results:**
    *   The user is redirected to `src/app/(app)/quizzes/results/[attemptId]/page.tsx`.
    *   This page fetches the specific quiz attempt data from Firestore using the `attemptId`.
    *   The score and maximum score are displayed.
    *   The `answersGiven` array is iterated through, and each question's details, the student's answer, the correct answer, and an explanation are displayed using the `AnswerReviewItem` component.
5.  **Teacher Management:**
    *   The teacher dashboard pages (`src/app/(app)/teacher-dashboard/quizzes/manage/page.tsx`, `src/app/(app)/teacher-dashboard/quizzes/results/[quizId]/page.tsx`) interact with dedicated API routes for teacher operations.
    *   `src/app/api/teacher/quizzes`: Handles fetching all quizzes (GET) and creating new quizzes (POST).
    *   `src/app/api/teacher/quizzes/[quizId]`: Handles fetching (GET), updating (PUT), and deleting (DELETE) a specific quiz.
    *   `src/app/api/teacher/questions`: Handles creating new questions for a quiz (POST).
    *   `src/app/api/teacher/questions/[questionId]`: Handles fetching (GET), updating (PUT), and deleting (DELETE) a specific question.
    *   Teacher components (`QuizForm.tsx`, `QuestionEditorForm.tsx`) provide the UI for these management tasks.

## Firestore Data Models

The core data for the quiz system is stored in Firestore across three main collections:

-   **`quizzes`**:
    -   `quizId` (string): Unique ID of the quiz.
    -   `title` (string): Title of the quiz.
    -   `description` (string): Short description of the quiz.
    -   `chapterId` (string): ID of the related chapter.
    -   `gradeId` (string): ID of the related grade.
    -   `timeLimit` (number, optional): Time limit for the quiz in minutes.
    -   `createdAt` (Timestamp): Timestamp of creation.
    -   `updatedAt` (Timestamp): Timestamp of last update.

-   **`questions`**:
    -   `questionId` (string): Unique ID of the question.
    -   `quizId` (string): ID of the quiz this question belongs to.
    -   `questionText` (string): The text of the question.
    -   `questionType` (string): Type of question (e.g., 'single-choice', 'multiple-choice', 'short-answer').
    -   `options` (string[]): Array of options for multiple-choice questions.
    -   `correctAnswer` (string | string[]): The correct answer(s). Type depends on `questionType`.
    -   `points` (number): Points awarded for a correct answer.
    -   `explanation` (string, optional): Explanation for the correct answer.
    -   `createdAt` (Timestamp): Timestamp of creation.
    -   `updatedAt` (Timestamp): Timestamp of last update.

-   **`quizAttempts`**:
    -   `attemptId` (string): Unique ID of the attempt.
    -   `userId` (string): ID of the user who took the quiz.
    -   `quizId` (string): ID of the quiz attempted.
    -   `quizTitle` (string): Title of the quiz at the time of attempt.
    -   `score` (number): The user's score.
    -   `maxScore` (number): The maximum possible score for the quiz.
    -   `answersGiven` (array):
        -   `questionId` (string): ID of the question.
        -   `answer` (string | string[]): The answer given by the user.
        -   `isCorrect` (boolean): Whether the given answer was correct.
    -   `startedAt` (Timestamp): Timestamp when the attempt started.
    -   `completedAt` (Timestamp): Timestamp when the attempt was completed/submitted.

## Frontend Components

-   **`src/app/(app)/quizzes/page.tsx`**: The main page listing all available quizzes. It fetches quiz data and the user's attempt history to display relevant information.
-   **`src/app/(app)/quizzes/[quizId]/page.tsx`**: The page where a user takes a specific quiz. It fetches quiz and question data, manages the user's interaction, and submits the answers.
-   **`src/app/(app)/quizzes/results/[attemptId]/page.tsx`**: Displays the detailed results of a completed quiz attempt. It fetches the attempt data and uses `AnswerReviewItem` to show question-by-question results.
-   **`src/components/quizzes/QuestionDisplay.tsx`**: Renders a single question based on its type, providing the appropriate input fields for the user to select/enter their answer.
-   **`src/components/quizzes/QuizTimer.tsx`**: A reusable component to display a countdown timer. Can be integrated into the quiz taking page if a time limit is set.
-   **`src/components/quizzes/QuizNavigation.tsx`**: Provides navigation controls (Next, Previous, Submit) and displays the user's progress through the quiz.
-   **`src/components/quizzes/AnswerReviewItem.tsx`**: Displays a single question and its details (student's answer, correct answer, explanation, correctness) for the results review page.

## Backend API Routes

-   **`/api/quizzes/submitAttempt` (POST)**: Receives quiz submissions from students. Performs server-side scoring and saves the attempt to Firestore.
-   **`/api/teacher/quizzes` (GET, POST)**:
    -   GET: Fetches a list of all quizzes (for teacher view).
    -   POST: Creates a new quiz (teacher only).
-   **`/api/teacher/quizzes/[quizId]` (GET, PUT, DELETE)**:
    -   GET: Fetches details of a specific quiz.
    -   PUT: Updates an existing quiz (teacher only).
    -   DELETE: Deletes a quiz (teacher only).
-   **`/api/teacher/questions` (POST)**: Creates a new question for a specified quiz (teacher only).
-   **`/api/teacher/questions/[questionId]` (GET, PUT, DELETE)**:
    -   GET: Fetches details of a specific question.
    -   PUT: Updates an existing question (teacher only).
    -   DELETE: Deletes a question (teacher only).

## Extending and Modifying

### Adding New Question Types

1.  **Update Firestore Data Model:**
    *   Modify the `Question` interface in `src/lib/types.ts` to accommodate any new fields required for the new question type (e.g., different option structures, validation rules).
2.  **Update `QuestionDisplay.tsx`:**
    *   In the `QuestionDisplay` component, add a new case to handle the rendering logic for the new `questionType`. Use appropriate Shadcn UI components or standard HTML inputs.
    *   Implement the logic to capture the user's input for this new type and pass it back to the parent component.
3.  **Update `QuestionEditorForm.tsx`:**
    *   Add the new question type to the `questionType` dropdown options.
    *   Implement conditional rendering logic to display the relevant input fields (options, correct answer input) based on the selected question type.
4.  **Update Backend Scoring Logic (`/api/quizzes/submitAttempt`):**
    *   Modify the scoring logic in the `submitAttempt` API route to correctly validate and score the new question type's answers. This might involve adding new helper functions for different validation methods.
5.  **Update `AnswerReviewItem.tsx`:**
    *   Add rendering logic to display the question, student's answer, correct answer, and explanation for the new question type in the results review.
6.  **Update Firestore Security Rules:**
    *   Review and potentially update `firestore.rules` if the new question type introduces any new fields or structures that require specific access controls (unlikely for just a new type, but good practice to check).

### Modifying Scoring Logic

The core scoring logic resides in the `/api/quizzes/submitAttempt` API route. To modify it:

1.  Open `src/app/api/quizzes/submitAttempt/route.ts`.
2.  Locate the section where the submitted `answersGiven` are compared to the correct answers fetched from Firestore.
3.  Adjust the comparison and scoring algorithm as needed. You might refactor this logic into a separate utility function for better organization and testability, especially if different scoring methods are introduced for different question types.
4.  Ensure that the `isCorrect` flag for each answer in the `quizAttempts` document is set correctly based on the updated scoring logic.

### Teacher Management Enhancements

-   **Adding New Fields to Quizzes/Questions:**
    *   Update the TypeScript interfaces in `src/lib/types.ts`.
    *   Modify the `QuizForm.tsx` and `QuestionEditorForm.tsx` components to include input fields for the new data.
    *   Update the relevant teacher API routes (`/api/teacher/quizzes`, `/api/teacher/quizzes/[quizId]`, `/api/teacher/questions`, `/api/teacher/questions/[questionId]`) to handle saving and retrieving the new fields from Firestore.
-   **Enhancing Results View:**
    *   Modify `src/app/(app)/teacher-dashboard/quizzes/results/[quizId]/page.tsx` to display additional aggregate data or visualizations.
    *   Implement the "Weak Area Identification" logic by analyzing the `quizAttempts` data for a given quiz. This might involve querying attempts and potentially linking back to question metadata (e.g., topics or difficulty levels stored on the question documents). The UI would need to be built to present this analysis.

This guide covers the fundamental aspects of the quiz system's implementation. For detailed code structure, refer to the files mentioned and the `PROJECT_STRUCTURE_AND_DATAFLOW.md` document.