#!/usr/bin/env bash
set -e

echo "Continuing atomic commit sequence..."

# 7b. Remaining Backend files
git add backend/controllers/ backend/db/ backend/package-lock.json backend/providers/ backend/scripts/ backend/services/resultMerger.js backend/.env.example || true
git commit -m "chore(backend): add supporting backend utilities and dependencies" || true

# 8. Frontend Setup
git add frontend/package.json frontend/vite.config.js frontend/index.html frontend/eslint.config.js 2>/dev/null || true
git commit -m "feat(frontend): setup vite React app structure" || true

# 9. Frontend Mock EHR
git add frontend/src/components/ 2>/dev/null || true
git commit -m "feat(frontend): build mock EHR UI components" || true

# 10. Frontend Context
git add frontend/src/context/ frontend/src/utils/ 2>/dev/null || true
git commit -m "feat(frontend): implement discharge form context and state" || true

# 11. Frontend Main Layout
git add frontend/src/App.jsx frontend/src/main.jsx frontend/src/index.css frontend/public/ frontend/assets/ 2>/dev/null || true
git commit -m "feat(frontend): add sidebar and layout styling" || true

# Catch any remaining frontend files
git add frontend/
git commit -m "chore(frontend): finalize frontend assets and styling" || true

# 12. Agent workflow
git add discharge_agent/
git commit -m "feat(agent): implement ADK state machine for discharge review" || true

# 13. MCP
git add mcp-server/
git commit -m "feat(mcp): implement safe patient data read tools" || true

# 14. Backend tests
git add backend/tests/
git commit -m "test(backend): add unit tests for rule engine and scrubber" || true

# 16. Integration / Evals
git add tests/
git commit -m "test(agent): add ADK integration tests and eval scripts" || true

# 17. Artifacts
git add artifacts/
git commit -m "chore: add eval artifacts and local traces" || true

# 18. Docs / Specs
git add spec/
git commit -m "docs: add architecture specs and demo script" || true

# 19. Project Rules
git add AGENTS.md
git commit -m "chore: add custom agent rules for project" || true

# 20. README
git add README.md
git commit -m "docs: add comprehensive project README" || true

# Setup remote and push
git remote remove origin || true
git remote add origin https://github.com/pratikforge/clinical-safety-agent.git
git branch -M main
git push -u origin main
echo "Push complete!"
