# 5-Minute Video Demonstration Script

This script outlines the flow for a 5-minute video demonstration showing cross-platform synchronization, authorization isolation, and mobile resilience.

---

## ⏱️ Video Breakdown

### 0:00 – 0:45 | Introduction & Architecture Overview
- **Visual**: Show monorepo project structure (`/backend`, `/web`, `/mobile`, `/shared`, `/docs`).
- **Speaking Points**:
  - "Welcome! Today we are demonstrating the full-stack Project Management System built with a unified Node.js/Express/Prisma backend serving both a React Vite web app and a React Native Expo mobile app."
  - "Both applications share common TypeScript types, enums, and Zod validation schemas from `@project-mgmt/shared`."
  - "Notice our Swagger documentation is live at `/api/docs` and backend tests have 100% pass rate."

---

### 0:45 – 1:45 | Web Dashboard & Project Management
- **Visual**: Open Web app in browser (`http://localhost:5173`), click "Alice Smith" autofill demo login, click "Sign In".
- **Speaking Points**:
  - "We log in as Alice Smith on the web app. Notice the performance dashboard cards displaying aggregated metrics: 4 total projects, active projects in progress, and total task completion counters."
  - "Let's navigate to the Projects tab. We see search and status filtering in action."
  - "Click into **'Mobile App Redesign'**. We see the project timeline, task completion progress bar, and list of tasks."

---

### 1:45 – 2:45 | Cross-Platform Sync: Create on Web, Sync on Mobile
- **Visual**: Place Web app on the left side of the screen and Android Mobile App on the right side.
- **Speaking Points**:
  - "Now on the mobile app, we log in using the exact same credentials: `alice@example.com`."
  - "Tokens on mobile are stored exclusively in `expo-secure-store` (Android Keystore / iOS Keychain), never insecure AsyncStorage."
  - "On Web: Let's create a new task under 'Mobile App Redesign' titled: `**Prepare Expo EAS preview APK build**` with Priority: High."
  - "Now look at the mobile app: Pull down to refresh the project screen — the task appears immediately with the High priority badge."

---

### 2:45 – 3:45 | Mobile Task Interaction & Web Sync
- **Visual**: On the mobile app, tap the checkbox next to `Prepare Expo EAS preview APK build`.
- **Speaking Points**:
  - "On the mobile screen, we tap the checkbox to mark the task completed. The status immediately updates to Completed and strikes through."
  - "Back on the web app: We refresh the page, and the progress bar increases and the task reflects Completed status."
  - "Next, let's create a new project on mobile: Tap '+', name it `**Sprint 42 Deliverables**`, and save."
  - "On web: Switch to the Projects page and verify `Sprint 42 Deliverables` appears instantly."

---

### 3:45 – 4:30 | Authorization Isolation & Security Verification
- **Visual**: Log out from web and log in as `bob@example.com`.
- **Speaking Points**:
  - "Security and tenant isolation are critical requirements. Bob has logged in on the web app."
  - "Notice that Bob sees only his own single project (`Q4 Product Marketing Campaign`) and 0 tasks from Alice."
  - "If Bob attempts to directly query Alice's project or task IDs, our backend returns a strict `404 Not Found` (not 403), ensuring zero existence leaking between users."

---

### 4:30 – 5:00 | Offline Banner & Token Invalidation
- **Visual**:
  1. Toggle airplane mode / disconnect Wi-Fi on the mobile device or emulator. Show the amber `OfflineBanner` appearing instantly at the top of the mobile screen.
  2. On web, click "Log out". Show that user tokens are invalidated via the backend `tokenVersion` counter, preventing any stale token reuse.
- **Speaking Points**:
  - "When the mobile app detects network disconnection via NetInfo, it presents an amber banner informing the user that they are offline without crashing."
  - "Logging out increments `tokenVersion` on the database user record, revoking all existing JWT access tokens."
  - "Thank you for watching!"
