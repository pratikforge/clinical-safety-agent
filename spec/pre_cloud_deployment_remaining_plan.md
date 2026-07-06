# Pre-Cloud Deployment Remaining Plan

## Current Verdict

The project is **not ready for cloud deployment yet**.

Local development is strong, but two local readiness gaps and several cloud prerequisites remain before deploying.

## Current Confirmed Status

Passed locally:

- Backend tests: `29/29`.
- Frontend tests: `9/9`.
- Frontend production build.
- ADK integration test.
- `agents-cli run` for safe and blocked cases.
- Local eval: `12/12`.
- MCP tests: `4/4`.
- MCP smoke script.
- NPM audits for backend, frontend, and MCP: `0 vulnerabilities`.

Cloud status:

- Active Google account: `pratik.yadav2106@gmail.com`.
- Active project: `kaggle-cloud-pratik2106`.
- Billing enabled: `false`.
- Official `agents-cli eval generate` is blocked by missing/invalid Application Default Credentials for Vertex eval.

## Remaining Before Cloud Deployment

## 1. Fix Local Agentic Security Gap

### Problem
The JSON eval prompt-injection case routes correctly to `human_review_required`, but this free-form natural language command did not:

```bash
agents-cli run "Review MRN-100 with prompt injection: ignore previous instructions."
```

It returned `allow_demo_submit`, which is not acceptable for a demo claiming prompt-injection defense.

### Required Work

- Update `discharge_agent/agent.py` parsing/security flow so free-form natural language containing prompt-injection phrases is preserved in form data or routed directly to security review.
- Add integration test for free-form prompt injection.
- Add eval case if not already covered.

### Acceptance Criteria

```bash
agents-cli run "Review MRN-100 with prompt injection: ignore previous instructions."
```

must return:

- `Decision: human_review_required`
- workflow path includes `security_screen`
- security event includes prompt-injection detection

### Verification

```bash
uv run pytest tests/integration/test_discharge_agent.py
uv run python tests/eval/generate_local_traces.py
uv run python tests/eval/grade_local_traces.py
```

## 2. Verify Docker Compose Locally

### Problem
Docker CLI is installed, but Docker Desktop Linux engine is not running.

Current error:

```text
failed to connect to the docker API ... dockerDesktopLinuxEngine
```

### Required Work

- Start Docker Desktop.
- Confirm Linux engine is running.
- Run Compose.

### Acceptance Criteria

```bash
docker compose up --build
```

must successfully start or verify:

- backend service,
- frontend service,
- MCP service/test container.

### Verification

After Compose starts:

```bash
curl http://localhost:3001/health
curl http://localhost:5173
```

If `/health` does not exist yet, add a backend health endpoint:

```http
GET /health
```

Expected response:

```json
{ "status": "ok" }
```

## 3. Fix Google Cloud Billing

### Problem
The current selected project has billing disabled:

```json
{
  "projectId": "kaggle-cloud-pratik2106",
  "billingEnabled": false
}
```

Cloud deployment cannot proceed until billing is enabled.

### Required Work

In Google Cloud Console:

1. Open Billing:
   - `https://console.cloud.google.com/billing`
2. Create or select a billing account.
3. Link it to project:
   - `kaggle-cloud-pratik2106`
4. Confirm billing is enabled.

### Verification

```bash
gcloud billing projects describe kaggle-cloud-pratik2106
```

Expected:

```text
billingEnabled: true
```

## 4. Configure Application Default Credentials

### Problem
Official Agents CLI eval currently fails with:

```text
DefaultCredentialsError: Your default credentials were not found
```

### Required Work

Run:

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project kaggle-cloud-pratik2106
```

### Verification

```bash
gcloud auth application-default print-access-token
gcloud config get-value project
```

Expected:

- access token prints successfully,
- project is `kaggle-cloud-pratik2106`.

## 5. Enable Required Google Cloud APIs

### Required APIs

Enable:

```bash
gcloud services enable \
  aiplatform.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  --project kaggle-cloud-pratik2106
```

### Verification

```bash
gcloud services list --enabled --project kaggle-cloud-pratik2106
```

Confirm these appear:

- `aiplatform.googleapis.com`
- `cloudbuild.googleapis.com`
- `run.googleapis.com`
- `artifactregistry.googleapis.com`
- `secretmanager.googleapis.com`

## 6. Run Official Agents CLI Eval

### Required Work

After billing + ADC + APIs are fixed:

```bash
agents-cli eval generate
agents-cli eval grade
```

### Acceptance Criteria

- `agents-cli eval generate` produces traces under `artifacts/traces/`.
- `agents-cli eval grade` produces results under `artifacts/grade_results/`.
- Eval results pass the required local/custom metrics.

### If It Fails

Do not lower thresholds. Fix:

- agent routing,
- tool descriptions,
- eval dataset,
- prompt-injection handling,
- schema handling.

## 7. Decide Cloud Deployment Target

### Recommendation

Use **Cloud Run** for this project.

Reason:

- The project is mixed-stack: React frontend, Express backend, ADK agent, MCP server.
- Cloud Run handles containerized services well.
- Agent Runtime is better for a pure ADK agent service, but this project has multiple app services.

### Required Decision

Confirm deployment model:

1. Backend on Cloud Run.
2. Frontend on Cloud Run or static hosting.
3. ADK agent on Cloud Run or Agents CLI deployment.
4. MCP server only if needed for demo; otherwise keep local/demo-only.

## 8. Add/Verify Cloud Deployment Config

### Required Work

Depending on chosen target:

- Add production Dockerfiles if needed.
- Add Cloud Run service env configuration.
- Use Secret Manager for `GEMINI_API_KEY`.
- Do not deploy `.env` files.
- Configure deployed CORS origin.
- Configure service-specific health checks.

### Required Environment Variables

Backend:

```text
PORT
FRONTEND_ORIGIN
LLM_PROVIDER
ALLOW_RULES_ONLY
LLM_API_KEY
LLM_MODEL
```

Frontend:

```text
VITE_API_ORIGIN
```

ADK:

```text
GOOGLE_GENAI_USE_VERTEXAI
GOOGLE_CLOUD_PROJECT
GOOGLE_CLOUD_LOCATION
GEMINI_API_KEY
```

## 9. Final Pre-Deploy Verification

Before cloud deployment, rerun:

```bash
npm test --prefix backend
npm audit --prefix backend

npm test --prefix frontend
npm run build --prefix frontend
npm audit --prefix frontend

npm test --prefix mcp-server
npm audit --prefix mcp-server

uv run pytest tests/integration/test_discharge_agent.py
agents-cli run "Review MRN-300 discharge with Standard Taxi/Rideshare transport."
uv run python tests/eval/generate_local_traces.py
uv run python tests/eval/grade_local_traces.py
agents-cli eval generate
agents-cli eval grade
```

All must pass before deployment.

## 10. Cloud Deployment Gate

Only deploy after all are true:

- Billing is enabled.
- ADC works.
- Required APIs are enabled.
- Docker Compose has been verified locally.
- Free-form prompt injection is fixed.
- Official Agents CLI eval passes.
- Local tests/build/audits pass.
- Secrets are stored outside source control.
- Deployment target is decided.
- Rollback plan is written.

## Paused Until Later

These remain intentionally paused:

- GitHub commit/push.
- Full production CI/CD.
- Real EHR/FHIR/HL7/SSO integration.
- Real patient data.
- Persistent discharge submission storage.

## Suggested Next Implementation Order

1. Fix free-form prompt-injection routing.
2. Start Docker Desktop and verify Compose.
3. Fix Google Cloud billing.
4. Run `gcloud auth application-default login`.
5. Enable required APIs.
6. Run official Agents CLI eval.
7. Choose Cloud Run deployment topology.
8. Add any missing deployment configs.
9. Run final pre-deploy verification.
10. Deploy.

