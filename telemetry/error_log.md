# Error Log & Continuous Learning

## 2026-07-06: Vague Planning & Structure Violation
- **Description of Error:** Created a generic `testing_and_automation.md` file instead of embedding the required TDD, Guardrails, Cyber Attack tests, and Graphify workflow steps directly into the individual `frontend_architecture.md` and `backend_architecture.md` plans. This violated Rules #5 and #8, resulting in vague plans that lacked proper embedded security and testing steps.
- **Procedure that caused it:** Drafted the detailed specs without fully reading and strictly applying the structural mandates in `AGENTS.md` to each individual document.
- **Resolution:** Deleted the generic testing file, rewrote the frontend and backend specs to explicitly include TDD, OWASP Cyber Attack tests, and Graphify commands, and added Rule #12 to `AGENTS.md` to prevent this from happening again.
