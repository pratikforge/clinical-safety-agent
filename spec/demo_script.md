# Local Agentic Demo Script

This script walks through the local demonstration of the Hospital Discharge Safety agentic workflow.

> [!NOTE]
> **Billing Issue Note:** The official cloud deployment and Vertex AI-based Agent CLI evaluations are currently paused until the GCP project billing/activation issue is resolved. However, the local agentic proof of concept is complete, self-contained, and fully demonstrable using this script.

## 1. Start the Environment

You can start the local environment using Docker Compose:
```bash
docker compose up --build
```
Alternatively, start the backend and frontend manually in separate terminals:
```bash
# Terminal 1 (Backend)
cd backend
npm install
npm start

# Terminal 2 (Frontend)
cd frontend
npm install
npm run dev
```

## 2. Agentic Workflow via CLI

Use the ADK `agents-cli` to demonstrate the agent's decision-making process:

**Test a safe discharge (MRN-100):**
```bash
agents-cli run "Review a safe discharge plan for MRN-100."
```
*Expected Output:* The workflow path shows `allowed_decision` and readiness score 100.

**Test an unsafe/blocked discharge (MRN-300):**
```bash
agents-cli run "Review MRN-300 discharge with Standard Taxi/Rideshare transport."
```
*Expected Output:* The workflow path shows `blocked_decision` due to oxygen transport mismatch.

## 3. UI Evidence

1. Navigate to `http://localhost:5173`.
2. Select the safe patient **Maya Brooks (MRN-100)**.
3. Submit the form.
4. **Observe the Agent Workflow Sidebar:**
   - The UI explicitly renders the agent's workflow path: `parse` → `local_schema_check` → `security_screen` → `deterministic_safety_review` → `llm_advisory_review` → `allowed_decision`.
   - The final decision and agent mode are displayed.

## 4. MCP Demo Tooling

Verify that the agentic tools are exposed via MCP:

```bash
cd mcp-server
npm install
node scripts/smoke.js
```
*Expected Output:* A smoke test demonstrating `get_mock_patient`, `validate_discharge_plan`, `scrub_discharge_payload`, and `explain_rule` successfully running.

## 5. Local Evaluations

Run the local evaluation suite to prove consistency across 12 distinct edge cases (including PII leakage and prompt injection tests).

```bash
uv run python tests/eval/generate_local_traces.py
uv run python tests/eval/grade_local_traces.py
```
*Expected Output:* 12/12 cases passed successfully.

## 6. Optional: Real LLM Advisory Mode

If you have a Gemini API key:
1. In `backend/.env`, set `LLM_API_KEY="<insert_key_here>"` and `LLM_PROVIDER=gemini`.
2. Set `ALLOW_RULES_ONLY=false`.
3. Restart the backend.
4. Submit a warning-level discharge plan. The LLM will perform a safe advisory review on the *scrubbed* payload and return unstructured insights mapped as `WARN` alerts.
