# Changelog

All notable changes to this project are documented here. This project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (pre-1.0.0).

## [Unreleased] - Expected YYYY-MM-DD

### Added
- Initial project structure and core features: Next.js, React, TypeScript, Tailwind CSS, ShadCN UI.
- Genkit with Google Gemini 2.0 Flash for AI features.
- Basic PWA setup (manifest.json, sw.js).
- User session management (Firebase Google Sign-In, Firestore roles, offline debug login).
- Global app shell, sidebar, header, theme toggle.
- Student-facing features: dashboard, study materials, quizzes, AI assistant, mind maps, assignments, feedback, fun facts, and a library of placeholder simulations for Grades 9-12.
- Teacher dashboard: analytics, announcements, assignments, content management, lesson planner, daily diary, model papers, question paper generator, portfolio, and more.
- Static info pages: About Us, Philosophical Physics, Research Centers, Universities, Lab Equipment.
- This changelog file.
- Modular PDF resource management system: Teachers can now add, label, and manage any type of PDF (uploaded or linked) for any grade/chapter.
- UI for dynamic PDF resource management in the teacher dashboard.

### Changed
- Sidebar navigation is now hierarchical and categorized.
- Mind Maps use pre-generated static JSON data.
- Improved AI prompts and context awareness.
- Enhanced offline availability for global search and study material index.
- Assignment submission now focuses on link sharing for offline/free-tier use.
- Numerous UI/UX improvements and bug fixes.
- Refactored all chapters in `study-materials.json` to use a `pdfResources` array. Removed all legacy/hardcoded PDF fields.
- Improved code readability and maintainability for collaborators. All code is now modular and future-proof.
- UI/UX improvements for PDF management, file uploads, and resource labeling.

### Fixed
- Multiple Next.js runtime and import errors.
- Performance bottlenecks in study material loading and search.
- Issues with role switcher and icon definitions.
- CSS parsing and JavaScript errors in simulation components.
- Improved data fetching and error handling.

### Removed
- Old "Teacher Mode" toggle (replaced by User Session context).
- Redundant mentions of "STBB Aligned".
- All legacy PDF fields and related UI/configuration.
- All hints and comments indicating the app was made by AI.

### Known Issues / Pending Major Work
- All analytics, assignments, and student data are currently mock/demo only.
- Real student tracking, login, and progress data are not yet implemented.
- Backend integration for persistent storage and multi-user support is pending.
- Most simulations are placeholders; full interactivity is in progress.
- Content population for all study materials and info pages is incomplete.
- Dynamic quiz system and result tracking are not yet live.
- Advanced PWA features and robust offline sync are planned.
- Real PDF text extraction for AI tools is not yet implemented.

**Contributors:**
- Please focus on replacing mock data with real student tracking and backend integration.
- See `README.md` and `docs/blueprint.md` for more details and contribution guidelines.
