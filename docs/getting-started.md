# Getting Started with PhysicsLab

This guide will walk you through setting up and running the PhysicsLab project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js:** Version 18 or higher is recommended. You can download it from [nodejs.org](https://nodejs.org/).
*   **npm, yarn, or pnpm:** A package manager is required. npm is included with Node.js, or you can install yarn ([yarnpkg.com](https://yarnpkg.com/)) or pnpm ([pnpm.io](https://pnpm.io/)).
*   **Firebase CLI:** Required for interacting with Firebase services (Authentication, Firestore, etc.). Install it globally:
```
bash
    npm install -g firebase-tools
    
```
Log in to your Firebase account:
```
bash
    firebase login
    
```
*   **Git:** Required to clone the project repository.

## Setup Steps

1.  **Clone the Repository:**
    Open your terminal or command prompt and clone the PhysicsLab repository:
```
bash
    git clone <repository_url>
    cd PhysicsLab
    
```
Replace `<repository_url>` with the actual URL of the repository.

2.  **Install Dependencies:**
    Navigate into the cloned project directory and install the project dependencies using your preferred package manager:
```
bash
    # Using npm
    npm install

    # Using yarn
    yarn install

    # Using pnpm
    pnpm install
    
```
3.  **Set up Firebase Project:**
    PhysicsLab relies heavily on Firebase. You need to set up your own Firebase project:
    *   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    *   Enable **Firebase Authentication** (Email/Password or other providers you intend to use).
    *   Enable **Firestore Database**. Choose a starting mode (start in test mode for quick setup, but configure rules later).
    *   Enable **Cloud Storage**.
    *   **Optional:** Deploy Firebase Functions (especially for authentication triggers or backend logic in the `functions` directory). Navigate to the `functions` directory and run:
```
bash
        firebase deploy --only functions
        
```
*   **Connect your local project to Firebase:** In the root of your project directory, link your local project to your Firebase project:
```
bash
        firebase use --add
        
```
Select the Firebase project you created from the list.

4.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of your project directory. You will need to add your Firebase configuration and potentially other keys for AI services (if not handled solely by Genkit functions).

    Obtain your Firebase configuration from your Firebase project settings (Project settings > General > Your apps > Select your web app > Firebase SDK snippet > Config).

    Your `.env.local` file should look something like this:
```
env
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
    # Add other environment variables as needed, e.g., for Genkit setup if applicable
    
```
*Replace the placeholder values with your actual Firebase project details.*

5.  **Set up Genkit:**
    If you are running Genkit locally (as configured in `src/ai/genkit.ts` and flows), follow the Genkit specific setup. This typically involves:
    *   Ensuring you have the necessary AI provider credentials configured (e.g., Google Cloud credentials, environment variables for other models).
    *   Potentially running Genkit in development mode. Check the Genkit documentation and the project's AI configuration files (`src/ai/`). The `genkit.ts` file will indicate which plugins are used and what configuration is needed.

6.  **Run the Development Servers:**

    *   **Run the Next.js Development Server:**
        In the root project directory, start the Next.js development server:
```
bash
        # Using npm
        npm run dev

        # Using yarn
        yarn dev

        # Using pnpm
        pnpm dev
        
```
This will start the frontend application, usually accessible at `http://localhost:3000`.

    *   **Run the Genkit Development Server (if needed):**
        If your Genkit flows require a separate development server or specific local execution setup (depending on the plugins and configuration), follow the instructions in the Genkit documentation and the project's AI setup files. This might involve running a command like `genkit start`.

## Accessing the Application

Once both the Next.js and Genkit (if applicable) development servers are running, you can access the PhysicsLab application in your web browser at `http://localhost:3000`.

You can now explore the application, log in (if authentication is set up), and test the various features.