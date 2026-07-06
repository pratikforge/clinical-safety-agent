# Frontend Architecture Spec: Vite + React (Sidebar Overlay)

## 1. Graphify Knowledge Base (Start Phase)
- **Search Phase:** Before writing any frontend code, we MUST run:
  - `graphify query "frontend UI components and React state management"`
  - `graphify query "API contract between frontend and backend"`
- This ensures we understand the current workspace state, avoid duplication, and stay aligned with the backend contract.

## 2. Overview
The frontend serves two purposes:
1. **Mock EHR Page:** A realistic simulation of a hospital discharge form (since we don't have access to a real Epic/Cerner instance). This is the page the hospital staff fills out.
2. **Copilot Sidebar Widget:** A persistent right-side panel (Careerflow-style) that reads the form in real-time, displays the AI's safety analysis, and blocks submission if critical risks are detected.

**Tech Stack:** Vite + React 18 + Vanilla CSS (no Tailwind).

## 3. Folder Structure
```yaml
frontend:
  public:
    - index.html
  src:
    - main.jsx (Vite entry point, renders App)
    - App.jsx (Layout: MockEHR on left, CopilotSidebar on right)
    context:
      - DischargeFormContext.jsx (Shared state for all form fields)
    components:
      MockEHR:
        - PatientHeader.jsx (Read-only patient identity banner)
        - DischargeForm.jsx (The interactive form with all discharge fields)
      CopilotSidebar:
        - SidebarContainer.jsx (The sliding drawer with open/close toggle)
        - ReadinessScore.jsx (Circular percentage gauge)
        - AlertList.jsx (Scrollable list of validation results)
        - AlertItem.jsx (Single alert row: icon + message + severity color)
    hooks:
      - useDebounce.js (Debounces form changes before triggering API calls)
    services:
      - apiClient.js (Single function to call POST /api/validate-discharge)
    styles:
      - index.css (Global design system: CSS variables, fonts, resets)
      - mockehr.css (Styles for the mock hospital form)
      - sidebar.css (Glassmorphism panel, slide-in animation, alert colors)
```

## 4. Discharge Form Fields (What MockEHR Renders)
The form must contain every field from our Perplexity research. These are the exact inputs the staff will fill out and the AI will validate:

```yaml
Patient & Administrative:
  - patientName: text (pre-filled from mock DB, read-only)
  - dateOfBirth: date (pre-filled, read-only)
  - mrn: text (Medical Record Number, pre-filled, read-only)
  - dischargeDate: date (required, editable)
  - dischargeStatus: select [Routine, Against Medical Advice, Deceased, Transferred]

Discharge Destination:
  - destination: select [Home, Skilled Nursing Facility, Rehab Center, Long-Term Care, Hospice]
  - destinationAddress: text (required if Home)
  - livesAlone: checkbox
  - stairsAtHome: select [None, 1-5 steps, 6+ steps, Elevator available]

Caregiver:
  - caregiverName: text
  - caregiverPhone: tel
  - caregiverRelationship: text
  - caregiverAvailableOnDischarge: checkbox

Transportation:
  - transportType: select [Self/Family, Standard Taxi/Rideshare, Wheelchair Van, Paratransit, Ambulance]

Medication:
  - medicationReconciliationComplete: checkbox
  - newMedications: textarea (free text list of new prescriptions)
  - insuranceVerified: checkbox

Follow-Up:
  - followUpType: text (e.g., "Cardiology")
  - followUpDate: date
  - followUpBooked: checkbox (confirmed vs. just recommended)

Equipment & Services:
  - equipmentNeeded: multi-select [Wheelchair, Walker, Hospital Bed, Oxygen, None]
  - homeHealthOrdered: checkbox
  - communityServicesReferral: checkbox

Signatures:
  - physicianSignature: checkbox (represents sign-off)
  - socialWorkerSignature: checkbox
```

## 5. State Management (DischargeFormContext)
```yaml
Context Shape:
  formData:
    # All fields from Section 4 above, keyed by field name.
    # Example: { dischargeDate: "2026-07-10", destination: "Home", ... }
  patientRecord:
    # The clinical history pulled from the mock DB on page load.
    # Example: { oxygenRequired: true, mobilityLevel: "wheelchair", ... }
  validationResult:
    readinessScore: number (0-100)
    alerts: array of { type: "BLOCK" | "WARN" | "PASS", field: string, message: string }
  uiState:
    sidebarOpen: boolean (default true)
    isValidating: boolean (loading spinner while AI thinks)
    submissionBlocked: boolean (true if any BLOCK alert exists)
```

**Trigger Logic:**
- On individual field `onBlur` (user leaves a field): No API call. Only local validation (e.g., "this field is required").
- On "Review Discharge" button click: The full form payload is debounced (300ms via `useDebounce`) and sent to `POST /api/validate-discharge`.
- On `submissionBlocked === true`: The final "Submit Discharge" button is visually grayed out and non-clickable.

## 6. API Contract (Frontend ↔ Backend)
The frontend will call exactly one endpoint. This contract MUST match the backend spec.

### Request: `POST /api/validate-discharge`
```yaml
Headers:
  Content-Type: application/json
Body:
  patientId: string (MRN)
  formData:
    dischargeDate: string (ISO date)
    dischargeStatus: string
    destination: string
    destinationAddress: string
    livesAlone: boolean
    stairsAtHome: string
    caregiverName: string
    caregiverPhone: string
    caregiverAvailableOnDischarge: boolean
    transportType: string
    medicationReconciliationComplete: boolean
    newMedications: string
    insuranceVerified: boolean
    followUpType: string
    followUpDate: string (ISO date)
    followUpBooked: boolean
    equipmentNeeded: array of strings
    homeHealthOrdered: boolean
    communityServicesReferral: boolean
    physicianSignature: boolean
    socialWorkerSignature: boolean
```

### Response: `200 OK`
```yaml
Body:
  readinessScore: number (0-100)
  alerts:
    - type: "BLOCK" | "WARN" | "PASS"
      field: string (which form field triggered this)
      message: string (human-readable explanation)
      rule: string (which validation rule fired, e.g., "OXYGEN_TRANSPORT_MISMATCH")
```

### Response: `503 Service Unavailable`
```yaml
Body:
  error: "LLM service is currently unavailable. Please try again."
```

## 7. Aesthetic Guidelines
- **Colors:** Deep slate background (`#0f172a`), accent green (`#22c55e`) for PASS, amber (`#f59e0b`) for WARN, crimson (`#ef4444`) for BLOCK.
- **Typography:** Google Font `Inter` for legibility on medical screens.
- **Micro-animations:** Sidebar slide-in (200ms ease-out), pulsing dot while AI is "thinking," smooth color transitions on alert severity changes.
- **Accessibility:** All form inputs must have associated `<label>` elements. All alerts must have `role="alert"` and `aria-live="polite"` for screen readers. Color must not be the only indicator of severity (icons required alongside colors).
- **Responsiveness:** The sidebar collapses into a bottom drawer on screens narrower than 768px.

## 8. Guardrails During Execution
- Strict ESLint + Prettier enforcement on all `.jsx` and `.css` files.
- Husky pre-commit hooks will run the full frontend test suite. If any test fails, the commit is blocked. No force commits (Rule #11).
- All text rendered from backend responses MUST be passed through React's default JSX escaping (no `dangerouslySetInnerHTML`). This is our primary XSS defense.
- A React `<ErrorBoundary>` component must wrap the entire `<App>` to catch render crashes gracefully rather than showing a white screen in a hospital.

## 9. Test-Driven Development (TDD) & Security

### A. Functional Test Scripts
- **Test:** Render `DischargeForm`, simulate typing into every field, assert that `DischargeFormContext` state updates correctly for each field.
- **Test:** Render `CopilotSidebar` with a mock `validationResult` containing one BLOCK, one WARN, and one PASS alert. Assert that three `AlertItem` components render with the correct colors and messages.
- **Test:** Render `ReadinessScore` with score=72. Assert the circular gauge displays "72%" and renders in amber (WARN range).
- **Test:** Set `submissionBlocked=true` in context. Assert the "Submit Discharge" button has `disabled` attribute and the correct grayed-out styling.

### B. Edge Cases & Failures
- **Test:** Mock `apiClient.js` to reject with a network timeout. Assert the sidebar displays "Service Unavailable — please try again" instead of crashing.
- **Test:** Mock `apiClient.js` to return malformed JSON (`{broken`). Assert the frontend catches the parse error and shows a safe fallback state.
- **Test:** Render `DischargeForm` with no `patientRecord` loaded (null). Assert the form shows a loading skeleton rather than crashing on null access.
- **Test:** Simulate pressing "Review Discharge" button 10 times in 500ms. Assert that only 1 API call is fired (debounce works).

### C. Cyber Attack Test Scripts (STRIDE / OWASP Top 10)
- **Cross-Site Scripting (XSS) — STRIDE: Tampering:** Inject `<script>alert('hack')</script>` and `<img src=x onerror=alert(1)>` into the `newMedications` textarea. Assert the DOM does not contain any executable script elements after render.
- **Denial of Service (DoS) — STRIDE: Denial of Service:** Simulate 200 rapid-fire keystrokes per second on all form fields simultaneously. Assert that debounce logic limits API calls to a maximum of 1 per 300ms and the UI remains responsive (no frozen frames).
- **Clickjacking — OWASP: Security Misconfiguration:** Verify that the app sets `X-Frame-Options: DENY` in its response headers so it cannot be embedded in a malicious iframe.
- **Open Redirect — OWASP: Server-Side Request Forgery:** Verify that no component uses `window.location` based on user-controlled input. All navigation must be hardcoded.

## 10. Graphify Knowledge Base (End Phase)
- **Update Phase:** After the frontend implementation is complete, we MUST run `graphify update .` to index all new React components, hooks, context providers, and CSS files into the knowledge graph.
- **Verify Phase:** Run `graphify query "frontend components"` to confirm the new components appear correctly in the graph.
