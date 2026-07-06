# Frontend Architecture Spec: Vite + React (Sidebar Overlay)

## 1. Graphify Knowledge Base (Start Phase)
- **Search Phase:** Before writing any frontend code, we MUST run `graphify query "frontend UI components"` to ensure we understand the current workspace state and don't duplicate efforts.

## 2. Overview & Component Tree
The frontend will simulate a hospital's EHR system and inject a floating "Copilot Sidebar" widget.
- **Tech Stack:** Vite + React + Vanilla CSS.
- **Components:** `App.jsx`, `MockEHR.jsx`, `CopilotSidebar.jsx` (Careerflow-style), `AlertList.jsx`.
- **State Management:** React Context to monitor keystrokes and trigger validations.

## 3. Guardrails During Execution
- Strict ESLint and Prettier enforcement.
- Husky pre-commit hooks will block any commit if tests fail. No force commits.
- Any UI component that renders raw text from the backend must sanitize it to prevent XSS.

## 4. Test-Driven Development (TDD) & Security
### A. Functional Test Scripts
- **Tests:** Verify that typing in the `MockEHR` form successfully updates the global state.
- **Tests:** Verify that the `CopilotSidebar` correctly renders Green/Yellow/Red alerts based on mock JSON responses.

### B. Edge Cases & Failures
- **Tests:** Simulate backend timeout (e.g., API takes >10s). Ensure the UI displays a graceful "Service Unavailable" loading state rather than crashing.
- **Tests:** Simulate invalid JSON response from the backend. Ensure the UI catches the error safely.

### C. Cyber Attack Test Scripts (STRIDE / OWASP Top 10)
- **Cross-Site Scripting (XSS):** Write a test injecting `<script>alert('hack')</script>` into the EHR input fields. Verify that the React frontend sanitizes the input and the script does not execute in the DOM.
- **Denial of Service (DoS):** Write a test simulating rapid-fire key presses (100 keystrokes per second) to ensure our debounce logic works and we don't accidentally DDoS our own backend API.

## 5. Graphify Knowledge Base (End Phase)
- **Update Phase:** After the frontend implementation is complete, we MUST run `graphify update .` to index the new React components into the knowledge graph.
