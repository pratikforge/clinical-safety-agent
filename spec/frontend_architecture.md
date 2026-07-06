# Frontend Architecture Spec: Vite + React Sidebar Overlay

## 0. Strict Critic Findings Applied
- **Missing source-of-truth boundaries:** Added explicit ownership rules so the browser captures staff input and renders risk, but the backend remains authoritative for clinical context, PII scrubbing, scoring, and block decisions.
- **Contract drift:** Added `caregiverRelationship`, `clientRequestId`, `requestId`, `llmStatus`, `summary`, and alert `source` so the frontend and backend contracts match exactly.
- **Weak real-time story:** Replaced the old button-only review flow with a safer ambient flow: local validation updates on every change, while backend validation is debounced, cancellable, and protected from stale responses.
- **Security ownership confusion:** Moved header-level controls such as `X-Frame-Options` and CSP to backend responsibility while keeping frontend E2E checks that verify those headers exist.
- **Missing failure UX:** Added stale result handling, request cancellation, unavailable LLM/rules-only states, malformed response handling, and null patient loading behavior.
- **Design risk:** Replaced "glassmorphism" with a dense, utilitarian clinical UI style better suited to repeated hospital workflows.

## 1. Scope and Non-Goals
The frontend is a capstone prototype of the **Social Services Copilot**. It contains:
1. **Mock EHR Page:** A realistic discharge planning form that simulates Epic/Cerner-style data entry without integrating with a real EHR.
2. **Copilot Sidebar Widget:** A persistent right-side panel that watches the form state, displays readiness, lists safety alerts, and blocks final submission when the backend returns any `BLOCK` alert.

**Tech Stack:** Vite + React 18 + Vanilla CSS, with Vitest and React Testing Library for tests. No Tailwind.

**Non-goals for this prototype:**
- No real Epic, Cerner, FHIR, HL7, SMART-on-FHIR, or hospital SSO integration.
- No real PHI. All patients are synthetic mock records.
- No client-side clinical decision authority. The browser may show local completeness checks, but clinical safety decisions come from the backend response.
- No persistence of discharge submissions. The final submit action is a demo state transition unless a future backend submission endpoint is explicitly designed.

## 2. Frontend Responsibility Boundary
```yaml
Frontend owns:
  - Rendering the mock EHR and sidebar.
  - Capturing and validating form shape locally.
  - Sending the current discharge plan and selected MRN to the backend.
  - Displaying backend alerts exactly as escaped React text.
  - Preventing final demo submission when any BLOCK alert is present.
  - Handling loading, stale, offline, malformed, and unavailable states.

Frontend must not own:
  - Patient clinical truth beyond synthetic display fixtures.
  - PII scrubbing or LLM prompt construction.
  - Deterministic safety rules.
  - Readiness scoring.
  - Audit logging for real clinical override decisions.
```

The frontend may keep a small synthetic patient summary fixture for the mock EHR header, but the backend mock database is authoritative for clinical fields such as oxygen need, mobility, fall risk, cognition, medication tier, and living situation.

## 3. Graphify Knowledge Base
- **Start Phase:** Before implementation, attempt:
  - `graphify query "frontend UI components and React state management"`
  - `graphify query "API contract between frontend and backend"`
- If `graphify-out/graph.json` does not exist yet, record that the graph is unavailable and continue. Do not block the MVP on graph creation.
- **End Phase:** After frontend implementation, run `graphify update .`, then `graphify query "frontend components"` to confirm the new components, hooks, context providers, and CSS files are indexed.

## 4. Folder Structure
```yaml
frontend:
  public:
    - index.html
  src:
    - main.jsx
    - App.jsx
    data:
      - mockPatients.js (synthetic display-only demographics keyed by MRN)
    context:
      - DischargeFormContext.jsx
    components:
      common:
        - ErrorBoundary.jsx
        - StatusBanner.jsx
      MockEHR:
        - PatientHeader.jsx
        - PatientSelector.jsx
        - DischargeForm.jsx
        - ReviewControls.jsx
      CopilotSidebar:
        - SidebarContainer.jsx
        - ReadinessScore.jsx
        - AlertList.jsx
        - AlertItem.jsx
        - SummaryMetrics.jsx
    hooks:
      - useDebounce.js
      - useDischargeValidation.js
    services:
      - apiClient.js
    utils:
      - fieldConfig.js
      - localValidators.js
      - severity.js
      - stableHash.js
    styles:
      - index.css
      - mockehr.css
      - sidebar.css
  tests:
    - contract.test.jsx
    - dischargeForm.test.jsx
    - copilotSidebar.test.jsx
    - validationFlow.test.jsx
```

## 5. Discharge Form Fields
Every field below must exist in `fieldConfig.js` and in the backend request schema.

```yaml
Patient & Administrative:
  - patientName: text (synthetic fixture, read-only, never sent to validation API)
  - dateOfBirth: date (synthetic fixture, read-only, never sent to validation API)
  - mrn: text (selected patient ID, read-only after selection)
  - dischargeDate: date (required)
  - dischargeStatus: select [Routine, Against Medical Advice, Deceased, Transferred]

Discharge Destination:
  - destination: select [Home, Skilled Nursing Facility, Rehab Center, Long-Term Care, Hospice]
  - destinationAddress: text (required when destination is Home)
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
  - newMedications: textarea
  - insuranceVerified: checkbox

Follow-Up:
  - followUpType: text
  - followUpDate: date
  - followUpBooked: checkbox

Equipment & Services:
  - equipmentNeeded: multi-select [Wheelchair, Walker, Hospital Bed, Oxygen, None]
  - homeHealthOrdered: checkbox
  - communityServicesReferral: checkbox

Signatures:
  - physicianSignature: checkbox
  - socialWorkerSignature: checkbox
```

## 6. State Management
`DischargeFormContext` owns UI state and form state. It does not calculate clinical risk.

```yaml
Context Shape:
  selectedPatientId: string
  patientSummary:
    # Synthetic display-only values from mockPatients.js.
    patientName: string
    dateOfBirth: string
    mrn: string
  formData:
    # All editable fields from Section 5, keyed by field name.
  localValidation:
    errors: array of { field: string, message: string }
    touchedFields: array of strings
    isCompleteEnoughForReview: boolean
  validationResult:
    requestId: string | null
    readinessScore: number | null
    llmStatus: "idle" | "used" | "rules_only" | "unavailable"
    alerts: array of {
      type: "BLOCK" | "WARN" | "PASS"
      field: string
      message: string
      rule: string
      source: "rules" | "llm" | "system"
    }
    summary:
      blockCount: number
      warnCount: number
      passCount: number
      missingItemsCount: number
      unresolvedRiskCount: number
  reviewState:
    status: "idle" | "dirty" | "validating" | "valid" | "error" | "stale"
    lastReviewedAt: string | null
    lastReviewedHash: string | null
    activeClientRequestId: string | null
    errorMessage: string | null
  uiState:
    sidebarOpen: boolean
    submissionBlocked: boolean
    submitAttempted: boolean
```

## 7. Validation and Interaction Flow
```yaml
On field change:
  - Update formData immediately.
  - Mark the field touched.
  - Run local shape/completeness validation only.
  - Set reviewState.status to dirty if the changed value affects backend validation.

Ambient backend review:
  - Debounce high-risk field changes by 700ms.
  - Do not call the API until patientId exists and required minimum fields are present.
  - Use AbortController to cancel the previous in-flight request when a newer review starts.
  - Include a unique clientRequestId in every request.
  - Ignore any response whose requestId does not match activeClientRequestId.

Manual review:
  - "Review Discharge" bypasses debounce and starts validation immediately.
  - While validating, keep the old result visible but mark it as stale.

Submit behavior:
  - If any BLOCK alert exists, "Submit Discharge" must be disabled.
  - If WARN alerts exist without BLOCK alerts, allow demo submit but show a confirmation state.
  - If no alerts or only PASS alerts exist, allow demo submit.
```

## 8. API Contract
The frontend calls `POST /api/validate-discharge` for risk review. The contract must match `backend_architecture.md`.

### `POST /api/validate-discharge`
Required header: `Content-Type: application/json`

#### Request Body
```yaml
clientRequestId: string
patientId: string
formData:
  dischargeDate: string
  dischargeStatus: string
  destination: string
  destinationAddress: string
  livesAlone: boolean
  stairsAtHome: string
  caregiverName: string
  caregiverPhone: string
  caregiverRelationship: string
  caregiverAvailableOnDischarge: boolean
  transportType: string
  medicationReconciliationComplete: boolean
  newMedications: string
  insuranceVerified: boolean
  followUpType: string
  followUpDate: string
  followUpBooked: boolean
  equipmentNeeded: array of strings
  homeHealthOrdered: boolean
  communityServicesReferral: boolean
  physicianSignature: boolean
  socialWorkerSignature: boolean
```

#### Success Response `200 OK`
```yaml
requestId: string
readinessScore: number
llmStatus: "used" | "rules_only" | "unavailable"
alerts:
  - type: "BLOCK" | "WARN" | "PASS"
    field: string
    message: string
    rule: string
    source: "rules" | "llm" | "system"
summary:
  blockCount: number
  warnCount: number
  passCount: number
  missingItemsCount: number
  unresolvedRiskCount: number
```

#### Error Responses
```yaml
400 Bad Request:
  error: "Malformed JSON request body."

404 Not Found:
  error: "Patient MRN-999 not found in database."

413 Payload Too Large:
  error: "Request body exceeds 100kb limit."

422 Unprocessable Entity:
  error: "Request validation failed."
  details:
    - field: string
      message: string

429 Too Many Requests:
  error: "Rate limit exceeded. Max 30 requests per minute."

503 Service Unavailable:
  error: "Validation service is currently unavailable. Please try again."
```

If the LLM is unavailable but deterministic backend rules still run, the backend should return `200 OK` with `llmStatus: "unavailable"` and a system `WARN` alert. The frontend must not treat that as a transport failure.

## 9. UI and Visual Design
- Use a dense, work-focused layout. Avoid marketing hero sections, decorative cards, gradients, glassmorphism, and oversized typography.
- Mock EHR area: light neutral clinical workspace (`#f8fafc`, `#e5e7eb`, `#111827`) with compact field groups and clear labels.
- Sidebar: high-contrast panel with solid background, 1px border, and clear severity bands.
- Severity colors:
  - `PASS`: green `#15803d`
  - `WARN`: amber `#b45309`
  - `BLOCK`: red `#b91c1c`
  - `SYSTEM`: blue-gray `#475569`
- Typography: use a system sans stack by default. Do not load Google Fonts from a CDN for the clinical demo.
- Readiness score bands:
  - `0-59`: BLOCK/red
  - `60-84`: WARN/amber
  - `85-100`: PASS/green
- Responsive behavior:
  - Desktop: fixed right sidebar, main form scrolls independently.
  - Under 768px: sidebar becomes a bottom drawer with stable height and no text overlap.
  - All controls must remain reachable by keyboard.

## 10. Accessibility Requirements
- Every input must have a visible `<label>` connected by `htmlFor`.
- Alerts must be text plus icon plus color; color cannot be the only severity cue.
- New or changed alerts render inside an `aria-live="polite"` region.
- Critical BLOCK status uses `role="alert"` only when newly introduced, not on every render.
- Sidebar open/close buttons must expose `aria-expanded`.
- Focus moves into the sidebar only when the user opens it manually, not when background validation completes.
- Respect `prefers-reduced-motion`.
- Automated accessibility tests should run with `axe` or equivalent where practical.

## 11. Security and Privacy Guardrails
- Never use `dangerouslySetInnerHTML`.
- Never store form data, patient summaries, alerts, or API payloads in `localStorage`, `sessionStorage`, IndexedDB, or URL query strings.
- Do not log full form payloads to the browser console.
- Backend response text is rendered only through JSX escaping.
- External network calls from the frontend are limited to the configured backend API origin.
- Header controls such as CSP, `X-Frame-Options`, and CORS are backend responsibilities; frontend E2E tests must verify them in the served app.
- Any displayed synthetic names/dates must be clearly mock data in seed fixtures, never copied from real patients.

## 12. Test Plan

### A. Functional Tests
- Render `DischargeForm`, fill every field, and assert `DischargeFormContext` updates with the exact field names in Section 5.
- Render `CopilotSidebar` with one BLOCK, one WARN, and one PASS alert. Assert severity icon, label, color class, and message render.
- Render `ReadinessScore` with scores `42`, `72`, and `95`. Assert red, amber, and green bands.
- Set `submissionBlocked=true`. Assert "Submit Discharge" has `disabled` and remains keyboard-focus safe.
- Simulate a WARN-only response. Assert demo submit is allowed only after confirmation.

### B. API and State Flow Tests
- Use MSW or an equivalent mock server to assert the request body includes `clientRequestId`, `patientId`, and `caregiverRelationship`.
- Simulate ten high-risk field changes in 500ms. Assert the debounced review fires at most one backend request.
- Simulate response B returning before older response A. Assert stale response A is ignored.
- Simulate request cancellation with `AbortController`. Assert no error banner is shown for intentional cancellation.
- Mock `llmStatus: "unavailable"` with `200 OK`. Assert the sidebar shows a rules-only/system warning, not a service outage.

### C. Edge Cases and Failures
- Mock network timeout. Assert the sidebar displays "Validation service unavailable. Please try again." without crashing.
- Mock malformed JSON. Assert the frontend catches the parse failure and shows a safe fallback state.
- Render with no selected patient. Assert the form shows a patient selection/loading state rather than null access crashes.
- Send an oversized local textarea value. Assert local validation warns before backend submission where practical.

### D. Cyber Attack Tests
- **XSS:** Enter `<script>alert('hack')</script>` and `<img src=x onerror=alert(1)>` in `newMedications`. Assert no executable nodes or event handlers are inserted.
- **DoS via interaction flood:** Simulate rapid changes across all fields. Assert debounce/cancellation limits backend calls and the UI remains responsive.
- **Clickjacking header verification:** In E2E against the dev server, verify backend-served headers include frame protection.
- **Open redirect:** Assert no component navigates with `window.location` from user-controlled input.

## 13. Acceptance Gates
- Frontend and backend API examples in both architecture docs are identical.
- No field in Section 5 is missing from the request schema unless explicitly display-only.
- All validation states are visible and understandable without opening devtools.
- No console errors during the primary demo path.
- Keyboard-only use can select a patient, complete the form, review discharge, inspect alerts, and submit when allowed.
- A BLOCK alert always disables final demo submission.
