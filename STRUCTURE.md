# PhysicsLab Project Structure

This document provides a detailed, hierarchical overview of the `PhysicsLab` project's file structure, explaining the purpose of key directories and files and how they interact within the Next.js App Router framework, integrated with Firebase and Genkit for AI features.

## High-Level Overview

PhysicsLab is structured around a Next.js application acting as the **Frontend App** and **API Layer**. It interacts with a **Firebase Backend** (Firestore for data, Auth for authentication, Storage for files, and Cloud Functions for server-side logic/triggers) and **AI Flows** powered by Genkit for features like content extraction and generation. Static data is managed in local JSON files.


# Project Structure Explained

This document provides a detailed, hierarchical overview of the `PhysicsLab` project's file structure.
```
.
├── CHANGELOG.md
├── PROJECT_STRUCTURE_AND_DATAFLOW.md
├── README.md
├── TODO.md
├── components.json
├── debug-log.txt
├── firestore.rules
├── how origin
├── ics-lab-v0.69
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── storage.rules
├── tailwind.config.ts
├── tsconfig.json
├── .idx
│   └── dev.nix
├── .vscode
│   └── settings.json
├── docs
│   ├── blueprint.md
│   └── dashboard-ui-todo.md
├── functions
│   └── src
│       ├── auth.ts
│       ├── index.ts
│       └── study_materials.ts
├── public
│   ├── images
│   │   └── sim-thumbnails
│   │       ├── placeholder1.png
│   │       ├── placeholder2.png
│   │       ├── placeholder3.png
│   │       └── placeholder4.png
│   ├── manifest.json
│   ├── sw.js
│   └── textbooks
│       ├── fulltextbooks
│       │   └── STBB
│       │       ├── 10TH PHYSICS STBB ComGreyOCR.PDF
│       │       ├── 11TH PHYSICS STBB ComGreyOCR.PDF
│       │       ├── 12TH PHYSICS STBB ComGreyOCR.PDF
│       │       └── 9TH PHYSICS STBB ComGreyOCR.PDF
│       └── grade9
│           └── PhyicsG9Ch1.pdf
├── scripts
│   ├── git-push-all.sh
│   └── pdf-to-text.js
└── src
    ├── App.tsx
    ├── ai
    │   ├── dev.ts
    │   ├── genkit.ts
    │   └── flows
    │       ├── ai-learning-assistant-flow.ts
    │       ├── extractChapterContentFlow.ts
    │       ├── generate-fun-fact.ts
    │       ├── generate-lesson-plan-flow.ts
    │       └── generate-mind-map-flow.ts
    ├── app
    │   ├── (app)
    │   │   ├── about-us
    │   │   │   └── page.tsx
    │   │   ├── assignments
    │   │   │   ├── [assignmentId]
    │   │   │   │   └── page.tsx
    │   │   │   └── page.tsx
    │   │   ├── feedback
    │   │   │   └── page.tsx
    │   │   ├── lab-equipment
    │   │   │   └── page.tsx
    │   │   ├── learn-with-ai
    │   │   │   └── page.tsx
    │   │   ├── layout.tsx
    │   │   ├── mdcat-preparation
    │   │   │   └── page.tsx
    │   │   ├── mind-maps
    │   │   │   └── page.tsx
    │   │   ├── model-papers
    │   │   │   └── page.tsx
    │   │   ├── page.tsx
    │   │   ├── philosophical-physics
    │   │   │   └── page.tsx
    │   │   ├── physics-timeline
    │   │   │   └── page.tsx
    │   │   ├── practicals
    │   │   │   └── page.tsx
    │   │   ├── quizzes
    │   │   │   ├── daily
    │   │   │   │   └── page.tsx
    │   │   │   ├── dashboard
    │   │   │   │   └── page.tsx
    │   │   │   ├── [quizId]
    │   │   │   │   └── page.tsx
    │   │   │   ├── results
    │   │   │   │   └── [attemptId]
    │   │   │   │       └── page.tsx
    │   │   │   ├── page.tsx
    │   │   │   └── topic
    │   │   │       └── [topicId]
    │   │   │           └── page.tsx
    │   │   ├── research-centers
    │   │   │   └── page.tsx
    │   │   ├── settings
    │   │   │   └── page.tsx
    │   │   ├── simulations
    │   │   │   ├── ac-power-g12
    │   │   │   │   └── page.tsx
    │   │   │   ├── [simId]
    │   │   │   │   └── page.tsx
    │   │   │   ├── binding-energy-mass-defect-g12
    │   │   │   │   └── page.tsx
    │   │   │   ├── black-hole-spacetime-visualizer
    │   │   │   │   └── page.tsx
    │   │   │   ├── blackbody-radiation-g12
    │   │   │   │   └── BlackbodyRadiationSim.tsx
    │   │   │   ├── capacitor-energy-g12
    │   │   │   │   └── CapacitorEnergySim.tsx
    │   │   │   ├── capacitor-networks-g12
    │   │   │   │   └── page.tsx
    │   │   │   ├── capacitor-rc-circuit-g11
    │   │   │   │   └── page.tsx
    │   │   │   ├── compton-effect-g12
    │   │   │   │   └── ComptonEffectSim.tsx
    │   │   │   ├── density-buoyancy-lab-g9
    │   │   │   │   └── page.tsx
    │   │   │   ├── dispersion-prism-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── electric-field-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── hall-effect-g12
    │   │   │   │   └── page.tsx
    │   │   │   ├── heat-engines-refrigerators-g12
    │   │   │   │   └── page.tsx
    │   │   │   ├── laser-principle-g12
    │   │   │   │   └── page.tsx
    │   │   │   ├── logic-gates-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── magnetic-fields-forces-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── measurement-tool-interactive-g9
    │   │   │   │   └── page.tsx
    │   │   │   ├── motion-constant-acceleration-g9
    │   │   │   │   └── page.tsx
    │   │   │   ├── motion-graphing-lab-g9
    │   │   │   │   └── page.tsx
    │   │   │   ├── motion-under-gravity-g9
    │   │   │   │   └── page.tsx
    │   │   │   ├── orbital-mechanics-g9
    │   │   │   │   ├── OrbitalMechanicsSim.tsx
    │   │   │   │   └── page.tsx
    │   │   │   ├── page.tsx
    │   │   │   ├── particle-accelerators-g12
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-balloons-static-electricity-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-bending-light-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-circuit-construction-kit-dc-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-energy-skate-park-basics-g9
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-energy-skate-park-work-g11
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-fluid-pressure-flow-g11
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-forces-motion-basics-g9
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-forces-motion-friction-g11
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-geometric-optics-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-ladybug-revolution-g11
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-moving-man-g9
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-my-solar-system-g11
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-pendulum-lab-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-projectile-motion-g9
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-sound-waves-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-states-of-matter-basics-g9
    │   │   │   │   └── page.tsx
    │   │   │   ├── phet-wave-on-a-string-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── projectile-motion-g11
    │   │   │   │   └── page.tsx
    │   │   │   ├── radioisotope-applications-g12
    │   │   │   │   └── page.tsx
    │   │   │   ├── ray-diagrams-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── ripple-tank-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── rocket-launch-rendezvous
    │   │   │   │   └── page.tsx
    │   │   │   ├── shm-spring-mass-g11
    │   │   │   │   └── page.tsx
    │   │   │   ├── sig-figs-practice-g11
    │   │   │   │   └── page.tsx
    │   │   │   ├── significant-figures-rules-practice-g9
    │   │   │   │   └── page.tsx
    │   │   │   ├── simple-circuits-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── simple-pendulum-shm-g11
    │   │   │   │   └── page.tsx
    │   │   │   ├── sound-wave-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── standard-model-explorer-g12
    │   │   │   │   └── page.tsx
    │   │   │   ├── states-of-matter-g9
    │   │   │   │   └── page.tsx
    │   │   │   ├── thermal-expansion-g9
    │   │   │   │   └── page.tsx
    │   │   │   ├── unit-converter-g11
    │   │   │   │   └── page.tsx
    │   │   │   ├── wave-generator-g10
    │   │   │   │   └── page.tsx
    │   │   │   ├── wave-on-a-string-g10
    │   │   │   │   └── page (4).tsx
    │   │   │   ├── wave-particle-duality-g12
    │   │   │   │   └── page.tsx
    │   │   │   └── xray-production-spectra-g12
    │   │   │       └── page.tsx
    │   │   ├── study-material
    │   │   │   └── [gradeId]
    │   │   │       └── [chapterId]
    │   │   │           └── page.tsx
    │   │   └── teacher-dashboard
    │   │       ├── accounts
    │   │       │   └── page.tsx
    │   │       ├── analytics
    │   │       │   └── page.tsx
    │   │       ├── announcements
    │   │       │   └── page.tsx
    │   │       ├── assignments
    │   │       │   ├── [assignmentId]
    │   │       │   │   └── edit
    │   │       │   │       └── page.tsx
    │   │       │   └── page.tsx
    │   │       ├── content-management
    │   │       │   └── page.tsx
    │   │       ├── daily-diary
    │   │       │   └── page.tsx
    │   │       ├── layout.tsx
    │   │       ├── lesson-planner
    │   │       │   └── page.tsx
    │   │       ├── manage-model-papers
    │   │       │   └── page.tsx
    │   │       ├── manage-study-materials
    │   │       │   └── page.tsx
    │   │       ├── my-portfolio
    │   │       │   └── page.tsx
    │   │       ├── page.tsx
    │   │       ├── quizzes
    │   │       │   └── page.tsx
    │   │       ├── scheme-of-study
    │   │       │   └── page.tsx
    │   │       └── timetable
    │   │           └── page.tsx
    │   ├── api
    │   │   ├── mind-maps
    │   │   │   └── route.ts
    │   │   ├── pdf-proxy
    │   │   │   └── route.ts
    │   │   ├── quizzes
    │   │   │   └── submitAttempt
    │   │   │       └── route.ts
    │   │   └── study-materials
    │   │       └── route.ts
    │   ├── components
    │   │   ├── assignments
    │   │   │   └── AssignmentForm.tsx
    │   │   ├── auth
    │   │   │   ├── login-button.tsx
    │   │   │   └── logout-button.tsx
    │   │   ├── layout
    │   │   │   └── app-shell.tsx
    │   │   ├── mind-maps
    │   │   │   ├── CustomMindMapNode.tsx
    │   │   │   ├── custom-mindmap-node.tsx
    │   │   │   └── visual-mind-map.tsx
    │   │   ├── simulations
    │   │   │   └── placeholders
    │   │   │       ├── DensityLabSimPlaceholder.tsx
    │   │   │       ├── LogicGatesPlaceholder.tsx
    │   │   │       ├── LogicGatesSimPlaceholder.tsx
    │   │   │       ├── ProjectileMotionPlaceholder.tsx
    │   │   │       ├── ProjectileMotionSimPlaceholder.tsx
    │   │   │       ├── WaveInterferencePlaceholder.tsx
    │   │   │       └── WaveInterferenceSimPlaceholder.tsx
    │   │   ├── study
    │   │   │   ├── chapter-detail-client.tsx
    │   │   │   └── index.ts
    │   │   ├── teacher
    │   │   │   └── manage-study-materials
    │   │   │       ├── grade-chapter-selector.tsx
    │   │   │       ├── pdf-resource-manager.tsx
    │   │   │       └── study-material-form.tsx
    │   │   ├── timeline
    │   │   │   ├── PhysicsTimeline.tsx
    │   │   │   └── PhysicsTimelineSVG.tsx
    │   │   └── ui
    │   │       ├── accordion.tsx
    │   │       ├── alert-dialog.tsx
    │   │       ├── alert.tsx
    │   │       ├── avatar.tsx
    │   │       ├── badge.tsx
    │   │       ├── button.tsx
    │   │       ├── calendar.tsx
    │   │       ├── card.tsx
    │   │       ├── chart.tsx
    │   │       ├── checkbox.tsx
    │   │       ├── dialog.tsx
    │   │       ├── dropdown-menu.tsx
    │   │       ├── form.tsx
    │   │       ├── input.tsx
    │   │       ├── label.tsx
    │   │       ├── menubar.tsx
    │   │       ├── popover.tsx
    │   │       ├── progress.tsx
    │   │       ├── radio-group.tsx
    │   │       ├── scroll-area.tsx
    │   │       ├── select.tsx
    │   │       ├── separator.tsx
    │   │       ├── sheet.tsx
    │   │       ├── sidebar.tsx
    │   │       ├── skeleton.tsx
    │   │       ├── slider.tsx
    │   │       ├── switch.tsx
    │   │       ├── table.tsx
    │   │       ├── tabs.tsx
    │   │       ├── textarea.tsx
    │   │       ├── toast.tsx
    │   │       ├── toaster.tsx
    │   │       ├── tooltip.tsx
    │   │       └── use-toast.ts
    │   ├── contexts
    │   │   ├── teacher-mode-context.tsx
    │   │   └── user-session-context.tsx
    │   ├── data
    │   │   ├── fun-facts-util.ts
    │   │   ├── fun-facts.json
    │   │   ├── grade9-physics-mindmap-stbb.json
    │   │   ├── lab-equipment.json
    │   │   ├── mind-map-data.json
    │   │   ├── mockAssignments.ts
    │   │   ├── philosophical-questions.json
    │   │   ├── physics-timeline.json
    │   │   ├── research-centers.json
    │   │   ├── study-materials.json
    │   │   └── universities.json
    │   ├── hooks
    │   │   ├── use-fun-facts-settings.ts
    │   │   ├── use-mobile.tsx
    │   │   ├── use-online-status.ts
    │   │   └── use-toast.ts
    │   ├── lib
    │   │   ├── constants.ts
    │   │   ├── debuglogger.ts
    │   │   ├── firebase.ts
    │   │   ├── mindmap-utils.ts
    │   │   ├── notifications.ts
    │   │   ├── types.ts
    │   │   └── utils.ts
    │   └── pages
    │       └── api
    │           └── log-error.ts
```
**Root Directory (`.`)**

*   `CHANGELOG.md`: Documents changes and updates made to the project.
*   `PROJECT_STRUCTURE_AND_DATAFLOW.md`: Existing document likely describing the overall architecture and data flow (to be potentially replaced or integrated).
*   `README.md`: Main project documentation, providing an overview, setup instructions, and usage information (to be enhanced).
*   `TODO.md`: List of tasks, improvements, and future work items.
*   `components.json`: Configuration file likely used by Shadcn UI for managing components.
*   `debug-log.txt`: A file used for logging debug information.
*   `firestore.rules`: Defines security rules for Firestore database access.
*   `how origin`: Unidentified file, potential leftover or specific configuration.
*   `ics-lab-v0.69`: Unidentified file or directory, potential leftover or specific configuration.
*   `next.config.ts`: Configuration file for the Next.js application.
*   `package-lock.json`: Records the exact versions of dependencies used in the project.
*   `package.json`: Lists project dependencies and scripts.
*   `postcss.config.mjs`: Configuration file for PostCSS, used with Tailwind CSS.
*   `storage.rules`: Defines security rules for Firebase Storage access.
*   `tailwind.config.ts`: Configuration file for Tailwind CSS.
*   `tsconfig.json`: TypeScript configuration file.

**Directories:**

*   `.idx`: Contains configuration files related to the development environment, possibly for indexing or specific tools.
    *   `dev.nix`: Nix package manager configuration file.
*   `.vscode`: Contains configuration files for Visual Studio Code.
    *   `settings.json`: VS Code workspace settings.
*   `docs`: Contains project documentation files.
    *   `blueprint.md`: Documentation file, likely outlining a project blueprint or design.
    *   `dashboard-ui-todo.md`: Documentation specifically for the dashboard UI to-do list.
*   `functions`: Contains Firebase Cloud Functions code.
    *   `src`: Source files for Cloud Functions.
        *   `auth.ts`: Cloud Functions related to authentication.
        *   `index.ts`: Entry point for Cloud Functions.
        *   `study_materials.ts`: Cloud Functions for managing study materials.
*   `public`: Contains static assets served directly by Next.js.
    *   `images`: Contains image files.
        *   `sim-thumbnails`: Placeholder images for simulation thumbnails.
    *   `manifest.json`: Web App Manifest file for PWA features.
    *   `sw.js`: Service Worker file for offline capabilities and caching.
    *   `textbooks`: Contains textbook files.
        *   `fulltextbooks`: Full PDF textbooks.
            *   `STBB`: Textbooks specifically for the STBB curriculum.
        *   `grade9`: Specific textbooks for Grade 9.
*   `scripts`: Contains utility scripts for various tasks.
    *   `git-push-all.sh`: Shell script for pushing Git changes.
    *   `pdf-to-text.js`: Node.js script for extracting text from PDFs.
*   `src`: Contains the main source code for the Next.js application.
    *   `App.tsx`: Root component of the application.
    *   `ai`: Contains code related to AI integration, specifically Genkit.
        *   `dev.ts`: Development-related AI configuration or scripts.
        *   `genkit.ts`: Genkit configuration file.
        *   `flows`: Contains Genkit flow definitions.
            *   `ai-learning-assistant-flow.ts`: Flow for the AI learning assistant feature.
            *   `extractChapterContentFlow.ts`: Flow for extracting content from textbook chapters.
            *   `generate-fun-fact.ts`: Flow for generating fun facts.
            *   `generate-lesson-plan-flow.ts`: Flow for generating lesson plans.
            *   `generate-mind-map-flow.ts`: Flow for generating mind maps.
    *   `app`: Directory for the Next.js App Router.
        *   `(app)`: A route group, likely containing the main application pages requiring a specific layout (defined by `layout.tsx` within this group).
            *   `about-us`: Page for the About Us section.
            *   `assignments`: Pages related to assignments.
                *   `[assignmentId]`: Dynamic route for specific assignment details.
            *   `feedback`: Page for collecting user feedback.
            *   `lab-equipment`: Page listing lab equipment.
            *   `learn-with-ai`: Page for the AI learning features.
            *   `layout.tsx`: Layout component for the pages within the `(app)` group.
            *   `mdcat-preparation`: Page for MDCAT preparation resources.
            *   `mind-maps`: Page for displaying and interacting with mind maps.
            *   `model-papers`: Page for accessing model papers.
            *   `page.tsx`: The root page of the `(app)` route group (likely the dashboard or main landing page).
            *   `philosophical-physics`: Page for philosophical discussions in physics.
            *   `physics-timeline`: Page displaying a physics timeline.
            *   `practicals`: Page listing physics practicals.
            *   `quizzes`: Pages related to quizzes.
                *   `daily`: Daily quiz page.
                *   `dashboard`: Quiz dashboard page.
                *   `[quizId]`: Dynamic route for specific quiz details.
                *   `results`: Pages for quiz results.
                    *   `[attemptId]`: Dynamic route for specific quiz attempt results.
                *   `topic`: Pages for quizzes filtered by topic.
                    *   `[topicId]`: Dynamic route for quizzes of a specific topic.
            *   `research-centers`: Page listing research centers.
            *   `settings`: Page for user settings.
            *   `simulations`: Pages for physics simulations. Contains numerous subdirectories for individual simulations (e.g., `ac-power-g12`, `density-buoyancy-lab-g9`, `phet-circuit-construction-kit-dc-g10`).
                *   `[simId]`: Dynamic route for individual simulation pages.
                *   Many specific simulation directories containing their respective `page.tsx` or simulation component files.
            *   `study-material`: Pages for study materials.
                *   `[gradeId]`: Dynamic route for specific grades.
                    *   `[chapterId]`: Dynamic route for specific chapters within a grade.
            *   `teacher-dashboard`: Pages for the teacher's dashboard.
                *   `accounts`: Teacher account management page.
                *   `analytics`: Teacher analytics page.
                *   `announcements`: Teacher announcements page.
                *   `assignments`: Teacher assignment management pages.
                    *   `[assignmentId]`: Dynamic route for specific teacher assignments.
                        *   `edit`: Page for editing a specific assignment.
                *   `content-management`: Page for managing various content types.
                *   `daily-diary`: Teacher daily diary page.
                *   `layout.tsx`: Layout component for teacher dashboard pages.
                *   `lesson-planner`: Teacher lesson planning page.
                *   `manage-model-papers`: Page for managing model papers.
                *   `manage-study-materials`: Page for managing study materials.
                *   `my-portfolio`: Teacher portfolio page.
                *   `page.tsx`: The main page for the teacher dashboard.
                *   `quizzes`: Teacher quiz management page.
                *   `scheme-of-study`: Teacher scheme of study page.
                *   `timetable`: Teacher timetable page.
            *   `universities`: Page listing universities.
            *   `university-programs`: Page listing university programs.
        *   `api`: Directory for Next.js API routes.
            *   `mind-maps`: API routes related to mind maps.
            *   `pdf-proxy`: API route for proxying PDF requests.
            *   `quizzes`: API routes related to quizzes.
                *   `submitAttempt`: API route for submitting quiz attempts.
            *   `study-materials`: API routes for study materials.
        *   `favicon.ico`: Favicon for the application.
        *   `globals.css`: Global CSS styles.
        *   `layout.tsx`: Root layout component for the entire application.
    *   `components`: Contains reusable React components.
        *   `assignments`: Components related to assignments.
        *   `auth`: Components related to authentication.
        *   `layout`: Layout components.
        *   `mind-maps`: Components for mind maps.
        *   `simulations`: Components related to simulations.
            *   `placeholders`: Placeholder components for simulations.
        *   `study`: Components for study material pages.
            *   `chapter-detail-client.tsx`: Client-side component for displaying chapter details.
            *   `index.ts`: Export file for study components.
        *   `teacher`: Components specifically for the teacher dashboard.
            *   `manage-study-materials`: Components for managing study materials as a teacher.
        *   `timeline`: Components for the physics timeline.
        *   `ui`: Shared UI components, likely from Shadcn UI. Contains numerous basic UI building blocks (e.g., `button.tsx`, `dialog.tsx`, `input.tsx`).
    *   `contexts`: React Context providers for managing global state.
        *   `teacher-mode-context.tsx`: Context for managing teacher mode state.
        *   `user-session-context.tsx`: Context for managing user session state.
    *   `data`: Contains static data files or mock data.
        *   `fun-facts-util.ts`: Utility functions for fun facts.
        *   `fun-facts.json`: JSON data for fun facts.
        *   `grade9-physics-mindmap-stbb.json`: Mind map data for Grade 9 physics (STBB).
        *   `lab-equipment.json`: JSON data for lab equipment.
        *   `mind-map-data.json`: General mind map data.
        *   `mockAssignments.ts`: Mock data for assignments.
        *   `philosophical-questions.json`: JSON data for philosophical questions.
        *   `physics-timeline.json`: JSON data for the physics timeline.
        *   `research-centers.json`: JSON data for research centers.
        *   `study-materials.json`: JSON data for study materials.
        *   `universities.json`: JSON data for universities.
    *   `hooks`: Custom React hooks.
        *   `use-fun-facts-settings.ts`: Hook for managing fun fact settings.
        *   `use-mobile.tsx`: Hook for detecting mobile viewports.
        *   `use-online-status.ts`: Hook for checking online status.
        *   `use-toast.ts`: Hook for displaying toasts/notifications (likely related to Shadcn UI).
    *   `lib`: Contains utility functions, constants, and library configurations.
        *   `constants.ts`: File for application constants.
        *   `debuglogger.ts`: Utility for logging debug messages.
        *   `firebase.ts`: Firebase initialization and configuration.
        *   `mindmap-utils.ts`: Utility functions for mind maps.
        *   `notifications.ts`: Utility functions for handling notifications.
        *   `types.ts`: TypeScript type definitions.
        *   `utils.ts`: General utility functions.
    *   `pages`: Directory for the deprecated Pages Router (contains one remaining API route).
        *   `api`: API routes from the Pages Router.
            *   `log-error.ts`: API route for logging errors.