# Capstone Plan: ADK 2.0 + Agents CLI Alignment

## Purpose
This plan upgrades the current Social Services Copilot from a secure custom React/Express prototype into a capstone-ready agentic system while preserving the benefits we already built:

- Deterministic backend safety rules remain authoritative for `BLOCK` decisions.
- PII scrubbing and outbound leak verification still run before any LLM call.
- The React sidebar keeps the clinical demo experience and displays structured risk.
- Existing Jest/Vitest tests remain the fast correctness gate.

The new ADK/Agents CLI layer should demonstrate the course concepts without replacing the safety engine with probabilistic agent behavior.

## Source Alignment
- Kaggle capstone page: `https://www.kaggle.com/competitions/vibecoding-agents-capstone-project`
- Google codelab pattern: `https://codelabs.developers.google.com/vibecode-ambient-expense-agent`
- ADK 2.0 overview: `https://adk.dev/2.0/`
- Agents CLI guide: `https://google.github.io/agents-cli/guide/getting-started/`

The relevant course pattern is: scaffold with Agents CLI, build an ADK 2.0 graph workflow, keep deterministic code-based routing, use the LLM only where judgment is needed, add a pre-LLM security screen, run local evaluation, and prepare a deployable/ambient demo.

## Evaluation Criteria Coverage

| Criterion | Current status | Planned capstone upgrade |
|---|---|---|
| Agent / Multi-agent system (ADK) | Not yet demonstrated in submitted app code | Add an ADK 2.0 workflow agent with multiple nodes/sub-agents around the existing safety engine. |
| MCP Server | Not yet implemented | Add a local MCP server exposing safe tools backed by existing backend services. |
| Antigravity | Not code-dependent | Record a demo segment showing Agents CLI/ADK workflow, test run, and UI result. |
| Security features | Strongly covered | Keep and surface PII scrubber, prompt-injection containment, schema validation, rate limiting, Helmet/CORS, and tests. |
| Deployability | Partially covered | Add Agents CLI scaffold/enhancement, Docker/Compose, env templates, and deployment notes. |
| Agent skills / Agents CLI | Not demonstrated by app code | Use Agents CLI workflow: scaffold/enhance, `agents-cli run`, `agents-cli eval`, and optional `agents-cli deploy`. |

Minimum target for submission: clearly demonstrate at least these four: **ADK agent**, **MCP server**, **security features**, and **deployability/Agents CLI evaluation**.

## Core Architecture Decision

Use a hybrid architecture:

```text
React Mock EHR
  -> Express Validation API
      -> deterministic ruleEngine/scoring/scrubber
      -> optional LLM provider

ADK 2.0 Agent Layer
  -> tools wrapping Express/backend services
  -> graph workflow for triage, security, review, and human decision
  -> Agents CLI eval/deploy lifecycle

MCP Server
  -> exposes selected safe tools for other agents and demos
  -> reuses the same backend contracts
```

Do **not** port the whole app into Python ADK. That would add risk and duplicate tested code. ADK should orchestrate and explain the discharge safety review; the existing backend should continue to own clinical facts, deterministic rules, scoring, and scrubbing.

## What ADK Fixes Compared With Current Custom Code

| Current drawback | ADK/Agents CLI fix | How we avoid losing current benefits |
|---|---|---|
| App looks like a traditional copilot, not an agent system | Add an ADK 2.0 `Workflow` with explicit graph nodes and typed outputs | Workflow calls existing backend tools instead of reimplementing safety logic. |
| No visible multi-agent orchestration | Add specialist nodes/sub-agents: intake, safety, advisory, compliance, discharge-summary | Deterministic safety node runs before advisory LLM node and cannot be downgraded. |
| No agent behavior evaluation | Add `tests/eval` dataset and `agents-cli eval` grading | Keep Jest/Vitest for code correctness; use Agents CLI only for agent behavior. |
| No Agent Skills / Agents CLI artifact | Add `.agents-cli-spec.md`, scaffold/enhance metadata, Makefile commands | Do not manually create framework boilerplate that Agents CLI should own. |
| No ambient/event-driven story | Add an optional ADK trigger endpoint for synthetic discharge events | Keep frontend manual workflow as primary demo; ambient trigger is a second demo path. |
| No MCP criterion | Add MCP tools backed by safe existing services | MCP exposes only synthetic records and sanitized validation outputs. |

## Proposed ADK Workflow

Use ADK 2.0 graph `Workflow`, not a loose chat-only agent.

### Nodes

1. `parse_discharge_event`
   - Accepts a JSON discharge review event from local CLI, playground, or trigger endpoint.
   - Normalizes to `{ patientId, formData, reviewMode }`.

2. `local_schema_check`
   - Validates field shape against the existing backend contract.
   - Routes invalid payloads to `human_review_required`.

3. `security_screen`
   - Calls existing scrubber/leak-verifier logic through a backend wrapper or shared tool adapter.
   - Flags prompt-injection attempts in free-text medication/discharge notes.
   - If unsafe, bypasses LLM and routes to human review.

4. `deterministic_safety_review`
   - Calls existing `ruleEngine`, `scoringService`, and schemas.
   - Produces authoritative `BLOCK`, `WARN`, `PASS`, score, and summary.
   - Any `BLOCK` routes directly to `human_review_required`.

5. `llm_advisory_review`
   - Runs only if deterministic review is safe enough and scrubber passes.
   - Produces advisory `WARN` only.
   - Cannot create or remove `BLOCK`.

6. `merge_agent_findings`
   - Calls or mirrors existing `resultMerger`.
   - Recomputes readiness through backend scoring.

7. `human_review_required`
   - Uses ADK human-in-the-loop request/resume for blocked, suspicious, or high-risk plans.
   - Records a synthetic approval/reject decision for demo/eval.

8. `final_discharge_summary`
   - Emits a concise structured final result:
     - `decision: allow_demo_submit | blocked | human_review_required`
     - `readinessScore`
     - `topAlerts`
     - `securityEvents`

### Why This Is Better Than Replacing the Backend

- ADK gives us explicit graph routing, state, HITL, eval, and deployability.
- The backend keeps the safety-critical deterministic code simple, testable, and framework-independent.
- The frontend keeps the polished clinical workflow.
- The LLM remains advisory, matching the original architecture specs.

## Proposed Multi-Agent Shape

Use either graph function nodes plus LLM nodes, or named sub-agents wrapped as nodes:

- `SafetyRulesAgent`: tool-driven, deterministic, no LLM authority.
- `PrivacyComplianceAgent`: verifies redaction and prompt-injection containment.
- `AdvisoryReviewAgent`: LLM-based, emits only advisory WARN findings.
- `DischargeCoordinatorAgent`: orchestrates the graph and prepares final explanation.

The coordinator must never ask the LLM whether a `BLOCK` should be removed.

## Proposed MCP Server

Add a local MCP server, likely under `mcp-server/`, with tools:

- `get_mock_patient(patientId)`
  - Returns synthetic demographics and non-sensitive clinical facts.

- `validate_discharge_plan(patientId, formData)`
  - Calls the backend validation path and returns the same contract as `/api/validate-discharge`.

- `scrub_discharge_payload(patientId, formData)`
  - Returns scrubbed payload plus redaction categories, never original PII.

- `explain_rule(ruleId)`
  - Returns a non-PII explanation of deterministic rule purpose.

Security constraints:

- MCP tools must not expose real PHI or raw scrubber maps.
- MCP validation must use the same schema as the backend API.
- MCP should be read/review-only; no persistence or real submission side effects.

## Agents CLI Project Plan

### Phase 1: Agent Spec and Scaffold

Create `.agents-cli-spec.md` describing:

- Problem: discharge safety review agent for synthetic hospital discharge plans.
- Tools: backend validation, scrubber, mock patient lookup, optional MCP.
- Safety constraints: no PHI, no LLM authority over deterministic `BLOCK`, no prompt-injection compliance.
- Deployment preference: prototype first, then Cloud Run or Agent Runtime only after local eval passes.

Run:

```bash
agents-cli info
agents-cli scaffold enhance .
```

Expected output:

- Agents CLI config added to the repo.
- Python ADK agent directory scaffolded without disturbing `backend/` and `frontend/`.
- Eval/deploy conventions created by the toolchain.

### Phase 2: ADK Agent Implementation

Likely files:

- `discharge_agent/agent.py`
- `discharge_agent/tools.py`
- `discharge_agent/schemas.py`
- `discharge_agent/config.py`
- `discharge_agent/fast_api_app.py`

Implementation rules:

- Use ADK 2.0 `Workflow` for the main agent.
- Use typed Pydantic models for node input/output.
- Use tool wrappers to call existing backend code or HTTP API.
- Keep deterministic decisions in code nodes, not in prompts.
- Use HITL for blocked or suspicious plans.

Verification:

```bash
agents-cli run "Review synthetic discharge event for MRN-300 with unsafe taxi transport"
```

### Phase 3: Agent Evaluation

Add local eval assets:

- `tests/eval/datasets/discharge-dataset.json`
- `tests/eval/generate_traces.py`
- `tests/eval/eval_config.yaml`
- `artifacts/traces/`
- `artifacts/grade_results/`

Minimum eval cases:

1. Safe discharge plan should pass with no human escalation.
2. Oxygen patient with taxi/rideshare should block.
3. Wheelchair patient with stairs/no elevator should block.
4. PII in free text should be redacted before advisory review.
5. Prompt-injection text should bypass LLM and route to human review.
6. WARN-only high-tier medication case should allow submit with warning.

Metrics:

- Routing correctness.
- Security containment.
- Deterministic safety preservation.
- Final explanation quality.

Commands:

```bash
agents-cli eval generate
agents-cli eval grade
```

### Phase 4: MCP Server

Implement the MCP server after ADK tools are stable.

Likely files:

- `mcp-server/package.json`
- `mcp-server/src/server.js`
- `mcp-server/src/tools/validateDischargePlan.js`
- `mcp-server/src/tools/getMockPatient.js`
- `mcp-server/src/tools/scrubDischargePayload.js`
- `mcp-server/tests/*.test.js`

Verification:

- Tool calls return the backend contract.
- Invalid patient IDs and malformed payloads return safe errors.
- No raw PII appears in scrub tool output.

### Phase 5: Deployability

Add deployment-ready artifacts:

- Root `README.md` with quick start and demo script.
- `docker-compose.yml` for frontend + backend + optional MCP.
- `backend/.env.example`
- `frontend/.env.example`
- `discharge_agent/.env.example`
- Optional Cloud Run notes generated through Agents CLI scaffold/enhance.

Verification:

```bash
docker compose up --build
npm test --prefix backend
npm test --prefix frontend
agents-cli run "..."
agents-cli eval grade
```

### Phase 6: Demo / Video Plan

Record these segments:

1. Open React app and show synthetic patient discharge form.
2. Trigger backend review and show `BLOCK` disabling submit.
3. Show ADK workflow graph/path or Agents CLI run output.
4. Show prompt-injection/PII case routed through security screen.
5. Show Agents CLI eval summary.
6. Show deployability: Docker Compose or Agents CLI deploy-ready config.
7. Mention MCP tools and run one tool call if time allows.

## Implementation Order

1. Write `.agents-cli-spec.md`.
2. Run `agents-cli info`; install/setup if missing.
3. Run `agents-cli scaffold enhance .`.
4. Build ADK tool wrappers around the existing backend API.
5. Build ADK 2.0 `Workflow` with deterministic routing.
6. Add `agents-cli run` smoke prompts.
7. Add eval dataset, trace generator, and eval config.
8. Add MCP server tools.
9. Add Docker/deployability docs.
10. Update README and video checklist.

## Acceptance Gates

- Existing backend tests still pass.
- Existing frontend tests still pass.
- ADK agent can run locally through Agents CLI.
- ADK agent demonstrates graph routing, security screen, deterministic review, advisory review, and HITL.
- Eval dataset contains at least six safety-relevant cases.
- Agents CLI eval produces a saved grade report.
- MCP server exposes at least three safe tools.
- Demo can show at least three capstone concepts without hand-waving.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| ADK layer duplicates backend safety logic | High | ADK calls backend/tool wrappers; backend remains source of truth. |
| LLM appears to control clinical blocking | High | Prompt and code enforce advisory `WARN` only; deterministic node runs first. |
| Agents CLI scaffold disrupts existing Node app | Medium | Use `scaffold enhance .`, commit/check worktree before and after, keep ADK in separate directory. |
| Eval becomes flaky | Medium | Use trace-based checks and LLM-as-judge only for qualitative agent behavior; keep deterministic assertions in Jest. |
| Deployment scope grows too large | Medium | Prototype-first: Docker Compose and deploy-ready notes before actual cloud deploy. |
| MCP exposes sensitive data | High | Synthetic data only, schema validation, scrubbed outputs, no raw maps or request body logging. |

## Recommendation

Proceed with the hybrid plan. It removes the main drawback of the current custom implementation: lack of visible ADK/Agents CLI agentic structure. It keeps the main benefit: a tested, deterministic safety engine that does not let the LLM override clinical blocking rules.

