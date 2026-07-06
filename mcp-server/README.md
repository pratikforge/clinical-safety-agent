# Discharge Safety MCP Server

This directory contains the Model Context Protocol (MCP) server for the Hospital Discharge Safety system. 

It provides tools that an LLM agent can use to interact with the deterministic safety backend safely.

## Available Tools

### 1. `get_mock_patient`
Retrieves a synthetic patient record. 
- **Input:** `{ "patientId": "MRN-100" }`
- **Output:** The synthetic patient record.

### 2. `validate_discharge_plan`
Runs the authoritative deterministic safety validation contract.
- **Input:** `{ "patientId": "MRN-100", "formData": { ... } }`
- **Output:** Backend validation result with `readinessScore`, `alerts`, `summary`, and `llmStatus`.

### 3. `scrub_discharge_payload`
De-identifies a synthetic patient and discharge plan before an advisory LLM review.
- **Input:** `{ "patientId": "MRN-100", "formData": { ... } }`
- **Output:** Scrubbed payload metadata and `leakVerification` status (`ok: boolean`). Ensure this returns `ok: true` before exposing data to an LLM.

### 4. `explain_rule`
Explains a deterministic backend safety rule in non-PII language.
- **Input:** `{ "ruleId": "OXYGEN_TRANSPORT_MISMATCH" }`
- **Output:** A short explanation of the safety rule.

## Running the Smoke Script
To verify the tools are working locally, you can run the smoke script:
```bash
node scripts/smoke.js
```
