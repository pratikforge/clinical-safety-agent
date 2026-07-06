#!/usr/bin/env bash
set -e

# Note: We are running the full pre-commit hook for EVERY commit. 
# This takes time, but strictly honors Rule #11 (No Force Commits).

echo "Starting atomic commit sequence (this will take a few minutes due to rigorous hook testing)..."

git add pyproject.toml uv.lock .python-version agents-cli-manifest.yaml .agents-cli-spec.md
git commit -m "chore: initialize python and agent project configs" || true

git add .gitignore .env.example docker-compose.yml .github/ .cloudbuild/
git commit -m "chore: setup docker, github actions, and cloudbuild config" || true

git add backend/app.js backend/server.js backend/package.json backend/config/
git commit -m "feat(backend): add core server setup and environment config" || true

git add backend/middleware/
git commit -m "feat(backend): implement security and logging middleware" || true

git add backend/services/ruleEngine.js backend/services/scrubberService.js backend/services/databaseService.js backend/services/piiLeakVerifier.js backend/services/scoringService.js backend/schemas/
git commit -m "feat(backend): add deterministic rule engine and PII scrubber" || true

git add backend/services/llmService.js
git commit -m "feat(backend): integrate LLM advisory service" || true

git add backend/routes/
git commit -m "feat(backend): implement validation routes and controllers" || true

git add frontend/package.json frontend/vite.config.js frontend/index.html frontend/tailwind.config.js frontend/postcss.config.js frontend/eslint.config.js
git commit -m "feat(frontend): setup vite React app structure and tailwind" || true

git add frontend/src/components/
git commit -m "feat(frontend): build mock EHR UI components" || true

git add frontend/src/context/ frontend/src/utils/
git commit -m "feat(frontend): implement discharge form context and state" || true

git add frontend/src/App.jsx frontend/src/main.jsx frontend/src/index.css frontend/public/
git commit -m "feat(frontend): add sidebar and layout styling" || true

git add discharge_agent/agent.py discharge_agent/__init__.py
git commit -m "feat(agent): implement ADK state machine for discharge review" || true

git add mcp-server/
git commit -m "feat(mcp): implement safe patient data read tools" || true

git add backend/tests/
git commit -m "test(backend): add unit tests for rule engine and scrubber" || true

git add frontend/src/tests/
git commit -m "test(frontend): add UI component and form validation tests" || true

git add tests/
git commit -m "test(agent): add ADK integration tests and eval scripts" || true

git add artifacts/
git commit -m "chore: add eval artifacts and local traces" || true

git add spec/
git commit -m "docs: add architecture specs and demo script" || true

git add AGENTS.md
git commit -m "chore: add custom agent rules for project" || true

git add README.md
git commit -m "docs: add comprehensive project README" || true

# Setup remote and push
git remote remove origin || true
git remote add origin https://github.com/pratikforge/clinical-safety-agent.git
git branch -M main
git push -u origin main
echo "Push complete!"
