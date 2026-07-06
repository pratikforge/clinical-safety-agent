# Project Rules

Please add your custom instructions for this project below.

1. Think Before Coding
Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

State your assumptions explicitly. If uncertain, ask.
If multiple interpretations exist, present them - don't pick silently.
If a simpler approach exists, say so. Push back when warranted.
If something is unclear, stop. Name what's confusing. Ask.
2. Simplicity First
Minimum code that solves the problem. Nothing speculative.

No features beyond what was asked.
No abstractions for single-use code.
No "flexibility" or "configurability" that wasn't requested.
No error handling for impossible scenarios.
If you write 200 lines and it could be 50, rewrite it.
Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

3. Surgical Changes
Touch only what you must. Clean up only your own mess.

When editing existing code:

Don't "improve" adjacent code, comments, or formatting.
Don't refactor things that aren't broken.
Match existing style, even if you'd do it differently.
If you notice unrelated dead code, mention it - don't delete it.
When your changes create orphans:

Remove imports/variables/functions that YOUR changes made unused.
Don't remove pre-existing dead code unless asked.
The test: Every changed line should trace directly to the user's request.

4. Goal-Driven Execution
Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

"Add validation" → "Write tests for invalid inputs, then make them pass"
"Fix the bug" → "Write a test that reproduces it, then make it pass"
"Refactor X" → "Ensure tests pass before and after"
For multi-step tasks, state a brief plan:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

5. Graphify as Primary Knowledge Base
STRICTLY avoid raw grepping and searching through the codebase. Instead, ALWAYS use Graphify as your primary source of codebase knowledge. Always use the knowledge graph in all cases unless there is an explicit need to refer to a particular code snippet directly.
Furthermore:
- Every implementation plan MUST explicitly start the search phase with Graphify.
- At the end of implementation, when changes are made, the plan MUST explicitly mention updating the Graphify knowledge graph.

6. Specifications Format
All specs must ONLY use the `.md` extension.

7. Structure and Features Detailing
During the detailed explanation of features and when creating structures, ALWAYS use YAML instead of JSON.

8. Strict Test-Driven Development (TDD) and Security
Before writing, changing, or touching even a single line of code, you MUST create a proper plan for implementation.
All plans and procedures must adhere to "TEST DRIVEN DEVELOPMENT". This means you must ALWAYS include:
- Guardrails during the execution of code.
- Test scripts to check whether the code is working properly.
- Test scripts for edge cases and potential failures.
- Test scripts for testing cyber attacks on that code to verify vulnerability against hacks and malicious intent.
For cyber attack test scripts, refer to the STRIDE framework, OWASP Top 10, and other established frameworks. Do not accumulate the explanations of these frameworks in this file to avoid context rot; instead, utilize the `cyber-security-frameworks` skill.

9. Error Logging and Continuous Learning
Whenever you make a mistake or encounter an error during execution, you MUST log the mistake in `telemetry/error_log.md`. Include a description of the error and the exact procedure or code that caused it. This creates a dataset of failures that we will use to dynamically update these rules and prevent future recurrence.