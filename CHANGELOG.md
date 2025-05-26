
# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (conceptually, as it's pre-1.0.0).

## [Unreleased] - Expected YYYY-MM-DD

### Added
- **Initial Project Structure & Core Features (Ongoing):**
  - Next.js 15+ (App Router), React 18+, TypeScript, Tailwind CSS, ShadCN UI.
  - Genkit with Google Gemini 2.0 Flash for AI features.
  - Basic PWA setup (`manifest.json`, `sw.js` for asset caching & study material list).
  - **User Session Management:**
    - Firebase Google Sign-In with Firestore for role detection (teacher/student).
    - Offline debug "Magic Login" for teachers.
    - Development mode role switcher (Guest, Student, Teacher) in header.
    - "View as Student" mode for authenticated teachers.
  - **Global App Shell:** Collapsible sidebar, header with global search, theme toggle.
  - **Student-Facing Features:**
    - Dashboard, Study Materials (dynamic from JSON, PDF caching via IndexedDB, interactive exercises), Quizzes (UI placeholders), Learn with AI (grade-personalized, image input), Mind Maps (static JSON, React Flow visualization), Assignments (student view, link submission), Feedback (offline queue & sync), Fun Facts Panel (AI batches, cached).
    - Extensive library of **placeholder simulations** for Grades 9-12 (STBB & PhET-inspired), each with a dedicated page outlining planned features.
    - **Functional Simulations (Basic to Moderate Interactivity):**
      - G9: Vernier Caliper, Hooke's Law, 1D Motion Graphing, Forces & Motion Workbench, States of Matter (T/P effects, P-V graph), Thermal Expansion, Motion Under Gravity, Density & Buoyancy Lab.
      - G10: Logic Gate Simulator, Wave Generator.
      - G11: Projectile Motion, Unit Converter, SHM (Spring-Mass & Pendulum), Sig Figs Practice, Capacitor RC Circuit.
    - Static info pages: About Us, Philosophical Physics, Research Centers, Universities, Lab Equipment (content from local JSON).
  - **Teacher Dashboard (Client-Side, `localStorage` based):**
    - Analytics (mock data visualizations).
    - Announcements (UI, local state).
    - Assignments Management (CRUD, mock submissions, feedback).
    - Content Management (edit PDF links, key points, exercises for study materials; overrides saved to teacher's `localStorage`).
    - Lesson Planner (AI-assisted 4A's model, editable, printable, savable to `localStorage`).
    - Daily Diary (calendar-based, categorized, savable to `localStorage`).
    - Model Papers Management (add/delete links by grade/year, savable to `localStorage`).
    - Question Paper Generator (AI-Assisted - foundational UI, simulated AI, `localStorage` drafts).
    - My Portfolio page.
    - Placeholders for Scheme of Study, Timetable.
- This `CHANGELOG.md` file.

### Changed
- Sidebar navigation to a hierarchical, categorized structure.
- Mind Maps feature to use pre-generated static JSON data instead of on-demand AI generation.
- Enhanced various AI prompts for better context awareness and free-tier optimization.
- Improved offline availability for global search data (study material index).
- Refined assignment submission to focus on link sharing for offline/free-tier viability.
- Updated styling for placeholder images to use icons.
- Numerous UI/UX polishes (animations, feedback, loading states).

### Fixed
- Multiple Next.js runtime errors related to component imports, keys in lists, and client/server component rules.
- Addressed performance bottlenecks in study material loading and global search.
- Resolved issues with the "Dev View As..." role switcher functionality.
- Corrected icon definition errors.
- Fixed CSS parsing errors related to `@import` statements.
- Addressed JavaScript errors in various simulation components during their initial implementation.
- Made data fetching and error handling more robust in several components.

### Removed
- Old "Teacher Mode" toggle from settings, replaced by more comprehensive User Session context and header controls.
- Redundant mentions of "STBB Aligned" where context was clear.

### Known Issues / Pending Major Work (for Contributors)
- Full interactivity for the vast majority of placeholder simulations.
- Comprehensive content population for all study materials (notes, exercises for all chapters/grades) and static info pages.
- Dynamic Quiz System (question bank, scoring, results persistence).
- True backend integration for user data, shared content, and full PWA offline sync (beyond current `localStorage`/`IndexedDB` per-browser caching).
- Advanced PWA features (full background sync, robust PDF offline management beyond current best-effort caching).
- Real PDF text extraction for AI tools.
- Implementation of advanced UX features (e.g., "Did You Know?" pop-ups, AI-augmented concept mapping).
