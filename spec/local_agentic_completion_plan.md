# Local Agentic Completion Plan

## Context
Cloud deployment is paused because the Google Cloud project activation is blocked by a billing account issue. GitHub commit/push is also paused by choice and should be handled later.

This plan focuses on completing the project locally so it can credibly be called an **agent-driven project** before cloud deployment work resumes.

## Current Local Baseline

Already implemented:

- React mock EHR frontend.
- Express backend safety API.
- Deterministic discharge safety rules.
- PII scrubber and outbound leak verifier.
- ADK/Agents CLI project metadata.
- `discharge_agent/` ADK workflow.
- `agents-cli run` working locally.
- MCP server with safe tools.
- Local eval dataset, trace generator, and deterministic grader.
- Docker Compose file and env examples.
- Tests passing across backend, frontend, ADK integration, and MCP.

Known blocker:

- Official `agents-cli eval generate` / `agents-cli eval grade` require Google Application Default Credentials in this environment. This is blocked until the billing/project activation issue is fixed.

## What “Truly Agentic” Should Mean Locally

The app should not merely have a backend plus a sidebar. It should show that an agent:

1. **Receives a task goal**, not just a button click.
2. **Chooses or follows a workflow** across multiple capabilities.
3. **Uses tools** to inspect patient context, validate safety, scrub data, and explain rules.
4. **Maintains explicit state** across the review: intake, security status, deterministic findings, advisory findings, decision.
5. **Handles uncertainty and risk** by routing to human review instead of pretending confidence.
6. **Produces a structured final decision** that the UI/CLI/demo can show.
7. **Can be evaluated** across multiple scenarios.
8. **Can expose tools to other agents** through MCP.

The goal is not to let the LLM make clinical decisions. The goal is to make the **workflow agentic while safety remains deterministic**.

## Local Completion Phases

## Phase 1: Strengthen ADK Workflow Into a Clear Agent System

### Objective
Upgrade the current ADK workflow from a simple linear pipeline into a visibly agentic workflow with explicit nodes, routing, state, and named specialist roles.

### Work Items

1. Add a `local_schema_check` node.
   - Validates parsed discharge payload before security and backend review.
   - Routes malformed input to `human_review_required`.

2. Add an explicit `deterministic_router` node.
   - If backend result has `BLOCK`, route to blocked/human-review path.
   - If security events exist, route to human-review path.
   - If WARN-only, route to advisory/confirmation path.
   - If PASS, route to allowed path.

3. Split final summary into separate decision nodes:
   - `blocked_decision`
   - `warn_confirmation_decision`
   - `allowed_decision`
   - `human_review_required`

4. Add typed Pydantic models for node state:
   - `ParsedDischargeEvent`
   - `SecurityScreenResult`
   - `SafetyReviewResult`
   - `AgentDecision`

5. Make the agent output include the workflow path.
   - Example: `parse -> schema_check -> security_screen -> deterministic_review -> blocked_decision`.
   - This makes the demo visibly agentic.

### Acceptance Criteria

- `agents-cli run "Review MRN-300 discharge with Standard Taxi/Rideshare transport."` shows a blocked decision and workflow path.
- `agents-cli run "Review a safe discharge plan for MRN-100."` shows allowed decision and workflow path.
- ADK integration tests verify at least safe, block, warn, and security paths.

### Verification

```bash
uv run pytest tests/integration/test_discharge_agent.py
agents-cli run "Review MRN-300 discharge with Standard Taxi/Rideshare transport."
agents-cli run "Review a safe discharge plan for MRN-100."
```

## Phase 2: Add Real Gemini Advisory LLM Integration, Safely

### Objective
Add a real advisory LLM mode for local demos using `GEMINI_API_KEY`, while preserving deterministic safety guarantees.

### Meaning
Currently the system runs in `rules_only` mode. That is safe, but it does not fully demonstrate an LLM-augmented agent. Adding Gemini means the agent can ask for **additional advisory WARN findings** after deterministic safety and PII checks pass.

### Work Items

1. Implement a real provider in `backend/providers/geminiProvider.js`.
   - Use `GEMINI_API_KEY`.
   - Keep `mockProvider` for tests.
   - Keep `ALLOW_RULES_ONLY=true` as the safe default.

2. Ensure the backend still calls LLM only after:
   - request schema validation,
   - patient lookup,
   - deterministic rules,
   - scrubber,
   - PII leak verifier.

3. Enforce advisory-only output:
   - LLM can return `WARN` only.
   - Drop any `BLOCK` or `PASS` from LLM output.
   - Drop any output containing PII-like strings.

4. Add ADK node `llm_advisory_review`.
   - Runs only when security screen passes.
   - Skips automatically if no API key.
   - Adds `llmStatus` to workflow output.

5. Update `.env.example` files.
   - Show rules-only default.
   - Show optional Gemini local mode.

### Acceptance Criteria

- With no key, local demo remains `rules_only` and passes.
- With `GEMINI_API_KEY`, advisory review can return additional WARN findings.
- Deterministic BLOCK is never removed or downgraded.
- Tests prove malformed/unsafe LLM output is dropped.

### Verification

```bash
npm test --prefix backend
uv run pytest tests/integration/test_discharge_agent.py
agents-cli run "Review MRN-200 warning case with high-tier medication."
```

## Phase 3: Expand Local Evaluation Coverage

### Objective
Move from 3 eval cases to a stronger local eval suite that proves agent behavior across safety, security, warning, and malformed-input paths.

### Meaning
More eval cases make the project defensible. The current 3 cases prove the skeleton works; a broader set proves this is not a single-demo happy path.

### Required Eval Cases

1. `safe_discharge`
   - Expected: `allow_demo_submit`, `RULES_CLEAR`.

2. `oxygen_taxi_block`
   - Expected: blocked/human review, `OXYGEN_TRANSPORT_MISMATCH`.

3. `mobility_stairs_block`
   - Expected: blocked/human review, `MOBILITY_STAIRS_NO_ELEVATOR`.

4. `fall_risk_lives_alone_block`
   - Expected: blocked/human review, `FALL_RISK_LIVES_ALONE_NO_CAREGIVER`.

5. `med_reconciliation_block`
   - Expected: blocked/human review, `MED_RECONCILIATION_INCOMPLETE`.

6. `missing_signature_block`
   - Expected: blocked/human review, signature rule.

7. `warn_only_followup`
   - Expected: allow with warning/confirmation, no `BLOCK`.

8. `prompt_injection_security`
   - Expected: `human_review_required`, security event.

9. `pii_redaction_security`
   - Expected: scrubbed payload verified, no raw phone/email/SSN in output.

10. `unknown_patient`
   - Expected: safe error/human review, no crash.

11. `malformed_payload`
   - Expected: schema-check failure/human review, no crash.

12. `equipment_gap_warn`
   - Expected: warning related to equipment/service gap.

### Work Items

1. Expand `tests/eval/datasets/basic-dataset.json`.
2. Expand `tests/eval/datasets/discharge-dataset.json`.
3. Update `tests/eval/grade_local_traces.py` with per-case deterministic expectations.
4. Add integration tests for representative cases.
5. Save fresh local eval artifacts under `artifacts/traces/` and `artifacts/grade_results/`.

### Acceptance Criteria

- Local eval passes all cases.
- Eval output clearly shows pass count, total count, and per-case result.
- README demo checklist references the expanded eval.

### Verification

```bash
uv run python tests/eval/generate_local_traces.py
uv run python tests/eval/grade_local_traces.py
```

## Phase 4: Add Agentic UI Evidence

### Objective
Make the React UI show that the decision came from an agent workflow, not only a REST validation endpoint.

### Meaning
The CLI proves agentic behavior, but judges will also see the app. The UI should display the workflow path and decision ownership clearly.

### Work Items

1. Add backend endpoint or adapter for agent review.
   - Option A: `/api/agent-review` calls the ADK bridge or local Python runner.
   - Option B: frontend remains backend-only, but sidebar displays workflow fields returned by backend.

2. Extend validation result shape to include optional:
   - `agentDecision`
   - `workflowPath`
   - `securityEvents`
   - `agentMode: "rules_only" | "advisory_llm" | "human_review_required"`

3. Update Copilot sidebar:
   - Add “Agent Workflow” section.
   - Show path chips: `parse`, `security`, `rules`, `advisory`, `decision`.
   - Show security event count.
   - Show decision: allowed, blocked, human review.

4. Add UI tests for workflow display.

### Acceptance Criteria

- Demo UI clearly shows agent workflow path.
- BLOCK still disables submit.
- WARN-only still shows confirmation path.
- No user-entered HTML is rendered as executable markup.

### Verification

```bash
npm test --prefix frontend
npm run build --prefix frontend
```

## Phase 5: Complete MCP Local Demonstration

### Objective
Make the MCP server not just present, but easy to demo as an agent-facing tool layer.

### Meaning
MCP server criterion is stronger if we can show tool calls and outputs, not merely code files.

### Work Items

1. Add `mcp-server/README.md`.
   - Tool list.
   - Example JSON inputs.
   - Expected outputs.

2. Add a small CLI smoke script:
   - `mcp-server/scripts/smoke.js`
   - Calls each tool handler directly.
   - Prints compact outputs for demo.

3. Add tests for:
   - unknown patient,
   - malformed form,
   - rule explanation,
   - scrubbed payload contains no raw PII.

4. Optional: Connect ADK agent to MCP tools through ADK `McpToolset`.
   - This would be the strongest local agentic story.
   - It may add complexity; do only after direct MCP server is stable.

### Acceptance Criteria

- `npm test --prefix mcp-server` passes.
- Smoke script demonstrates all tools.
- README documents how another agent would consume the MCP server.

### Verification

```bash
npm test --prefix mcp-server
node mcp-server/scripts/smoke.js
```

## Phase 6: Run and Fix Docker Compose Locally

### Objective
Verify local deployability beyond “files exist.”

### Meaning
`docker-compose.yml` currently exists, but we need to actually run it and fix any issues. This proves another machine can run the system locally.

### Work Items

1. Run:

```bash
docker compose up --build
```

2. Verify:
   - frontend loads,
   - backend health/smoke request works,
   - MCP service test container completes or server starts as expected.

3. Add a backend health endpoint if needed:
   - `GET /health`
   - returns `{ status: "ok" }`.

4. Add a root smoke script if helpful:
   - `scripts/smoke-local.ps1` or `scripts/smoke-local.js`.

5. Update README with confirmed Compose instructions.

### Acceptance Criteria

- Compose starts frontend and backend.
- Backend validation smoke works inside/outside Compose.
- README reflects the tested command.

### Verification

```bash
docker compose up --build
```

## Phase 7: Local Demo Script and Evidence Pack

### Objective
Prepare a repeatable local demo flow for video recording and judge review.

### Work Items

1. Create `spec/demo_script.md`.
2. Include exact commands:
   - frontend/backend start,
   - `agents-cli run`,
   - local eval,
   - MCP smoke,
   - Docker Compose.

3. Include expected outputs:
   - blocked MRN-300 output,
   - safe MRN-100 output,
   - eval pass count,
   - MCP scrub proof,
   - UI sidebar screenshots/video steps.

4. Add “billing issue note”:
   - official cloud eval/deploy paused until GCP billing activation is fixed.
   - local agentic proof remains complete.

### Acceptance Criteria

- A new developer can follow the demo script without guessing.
- The script explicitly maps each demo step to evaluation criteria.

## Paused / Out of Scope For Now

These are intentionally paused:

- Google Cloud deployment.
- Official Agents CLI eval against Vertex.
- GitHub commit/push.
- Production EHR/FHIR/HL7/SSO integration.
- Real patient data.
- Persistent discharge submission storage.

## Final Local Definition of Done

The local project can be called complete and agentic when:

- Backend tests pass.
- Frontend tests and build pass.
- ADK integration tests pass.
- `agents-cli run` demonstrates safe, warning, block, and security cases.
- Local eval has at least 10 cases and passes.
- MCP tests and smoke script pass.
- UI displays agent workflow evidence.
- Docker Compose is tested.
- README and demo script are accurate.
- No raw PII appears in logs, MCP outputs, eval artifacts, or LLM prompts.

## Recommended Implementation Order

1. Phase 1: strengthen ADK workflow.
2. Phase 3: expand local eval cases.
3. Phase 5: complete MCP demo tooling.
4. Phase 6: run/fix Docker Compose.
5. Phase 4: add agentic workflow evidence to UI.
6. Phase 2: add real Gemini advisory LLM mode.
7. Phase 7: write final demo script.

Reasoning:

- Workflow and eval should come first because they define what “agentic” means.
- MCP and Docker are lower-risk and improve evaluation coverage.
- UI workflow evidence is useful once the workflow contract is stable.
- Gemini LLM mode should be added after deterministic local behavior is strong, so it cannot destabilize the safety model.

