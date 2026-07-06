from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
BRIDGE_SCRIPT = REPO_ROOT / "backend" / "scripts" / "agentToolBridge.js"


class BackendToolError(RuntimeError):
    pass


def _call_bridge(action: str, payload: dict[str, Any]) -> dict[str, Any]:
    completed = subprocess.run(
        ["node", str(BRIDGE_SCRIPT)],
        input=json.dumps({"action": action, "payload": payload}),
        text=True,
        capture_output=True,
        cwd=str(REPO_ROOT),
        check=False,
        timeout=20,
    )
    if completed.returncode != 0:
        message = completed.stderr.strip() or completed.stdout.strip() or "backend tool failed"
        raise BackendToolError(message)
    result = json.loads(completed.stdout)
    if result.get("status") != "success":
        raise BackendToolError(result.get("error", "backend tool failed"))
    return result["data"]


def validate_discharge_plan(patient_id: str, form_data: dict[str, Any]) -> dict[str, Any]:
    """Validate a synthetic discharge plan using the authoritative backend safety engine.

    Args:
        patient_id: Synthetic MRN such as MRN-100, MRN-200, or MRN-300.
        form_data: Discharge form data matching the backend contract.

    Returns:
        The backend validation result with readiness score, alerts, summary, and LLM status.
    """
    return _call_bridge(
        "validate_discharge_plan",
        {"patientId": patient_id, "formData": form_data},
    )


def get_mock_patient(patient_id: str) -> dict[str, Any]:
    """Return a synthetic mock patient record by MRN.

    Args:
        patient_id: Synthetic MRN such as MRN-100, MRN-200, or MRN-300.

    Returns:
        A synthetic patient record. No real PHI is used in this prototype.
    """
    return _call_bridge("get_mock_patient", {"patientId": patient_id})


def scrub_discharge_payload(patient_id: str, form_data: dict[str, Any]) -> dict[str, Any]:
    """De-identify a synthetic patient and discharge plan before advisory review.

    Args:
        patient_id: Synthetic MRN such as MRN-100, MRN-200, or MRN-300.
        form_data: Discharge form data matching the backend contract.

    Returns:
        Scrubbed payload metadata and leak-verification status.
    """
    return _call_bridge(
        "scrub_discharge_payload",
        {"patientId": patient_id, "formData": form_data},
    )


def explain_rule(rule_id: str) -> dict[str, Any]:
    """Explain a deterministic backend safety rule in non-PII language.

    Args:
        rule_id: Rule identifier such as OXYGEN_TRANSPORT_MISMATCH.

    Returns:
        A short explanation of the safety rule.
    """
    return _call_bridge("explain_rule", {"ruleId": rule_id})
