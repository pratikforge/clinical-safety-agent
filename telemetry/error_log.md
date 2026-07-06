# Error Log & Continuous Learning

## 2026-07-06: Vague Planning & Structure Violation
- **Description of Error:** Created a generic `testing_and_automation.md` file instead of embedding the required TDD, Guardrails, Cyber Attack tests, and Graphify workflow steps directly into the individual `frontend_architecture.md` and `backend_architecture.md` plans. This violated Rules #5 and #8, resulting in vague plans that lacked proper embedded security and testing steps.
- **Procedure that caused it:** Drafted the detailed specs without fully reading and strictly applying the structural mandates in `AGENTS.md` to each individual document.
- **Resolution:** Deleted the generic testing file, rewrote the frontend and backend specs to explicitly include TDD, OWASP Cyber Attack tests, and Graphify commands, and added Rule #12 to `AGENTS.md` to prevent this from happening again.

## 2026-07-07: Weak Pre-Commit Hooks
- **Description of Error:** Wrote generic, weak pre-commit hooks that did not strictly enforce types, linting, or comprehensively run all tests. This required the user to prompt again for a strict check, which led to proper strict analysis.
- **Procedure that caused it:** Assumed a basic level of pre-commit validation was sufficient instead of proactively configuring strict gating (like `tsc --noEmit`, strict ESLint, and full test suite execution).
- **Resolution:** Added Rule #13 to `AGENTS.md` to ensure all future pre-commit hooks are configured with maximum strictness by default.
