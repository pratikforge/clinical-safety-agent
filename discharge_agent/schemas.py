from __future__ import annotations

from typing import Literal, Any

from pydantic import BaseModel, Field


class DischargeFormData(BaseModel):
    dischargeDate: str
    dischargeStatus: str
    destination: str
    destinationAddress: str
    livesAlone: bool
    stairsAtHome: str
    caregiverName: str
    caregiverPhone: str
    caregiverRelationship: str
    caregiverAvailableOnDischarge: bool
    transportType: str
    medicationReconciliationComplete: bool
    newMedications: str
    insuranceVerified: bool
    followUpType: str
    followUpDate: str
    followUpBooked: bool
    equipmentNeeded: list[str]
    homeHealthOrdered: bool
    communityServicesReferral: bool
    physicianSignature: bool
    socialWorkerSignature: bool


class ReviewRequest(BaseModel):
    patientId: str
    formData: DischargeFormData
    reviewMode: Literal["safe", "warn", "block", "security"] = "block"


class ParsedDischargeEvent(BaseModel):
    patientId: str
    formData: dict[str, Any]
    workflowPath: list[str] = Field(default_factory=list)
    schemaError: bool = False


class SecurityScreenResult(BaseModel):
    patientId: str
    formData: dict[str, Any]
    workflowPath: list[str]
    securityEvents: list[str]
    scrubbedPayload: dict[str, Any]
    schemaError: bool = False


class SafetyReviewResult(BaseModel):
    patientId: str
    formData: dict[str, Any]
    workflowPath: list[str]
    securityEvents: list[str]
    validation: dict[str, Any]
    schemaError: bool = False


class AgentDecision(BaseModel):
    decision: Literal["allow_demo_submit", "warn_confirmation", "blocked", "human_review_required"]
    readinessScore: int
    topAlerts: list[str] = Field(default_factory=list)
    securityEvents: list[str] = Field(default_factory=list)
    llmStatus: str
    workflowPath: list[str] = Field(default_factory=list)

