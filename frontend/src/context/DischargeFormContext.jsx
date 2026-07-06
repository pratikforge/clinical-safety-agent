import { createContext, useContext, useMemo, useReducer } from "react";
import { mockPatients, defaultPatientId } from "../data/mockPatients.js";
import { initialFormData } from "../utils/fieldConfig.js";
import { validateFormShape } from "../utils/localValidators.js";

const initialValidationResult = {
  requestId: null,
  readinessScore: null,
  llmStatus: "idle",
  alerts: [],
  summary: {
    blockCount: 0,
    warnCount: 0,
    passCount: 0,
    missingItemsCount: 0,
    unresolvedRiskCount: 0
  }
};

const initialReviewState = {
  status: "idle",
  lastReviewedAt: null,
  lastReviewedHash: null,
  activeClientRequestId: null,
  errorMessage: null
};

const DischargeFormContext = createContext(null);

function createInitialState() {
  const localValidation = validateFormShape(initialFormData);
  return {
    selectedPatientId: defaultPatientId,
    patientSummary: mockPatients[defaultPatientId],
    formData: initialFormData,
    localValidation,
    validationResult: initialValidationResult,
    reviewState: initialReviewState,
    uiState: {
      sidebarOpen: true,
      submissionBlocked: false,
      submitAttempted: false,
      warnConfirmationPending: false,
      submitted: false
    }
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "selectPatient": {
      const patientSummary = mockPatients[action.patientId] || null;
      return { ...state, selectedPatientId: action.patientId, patientSummary, reviewState: initialReviewState, validationResult: initialValidationResult };
    }
    case "updateField": {
      const formData = { ...state.formData, [action.field]: action.value };
      const localValidation = validateFormShape(formData);
      return {
        ...state,
        formData,
        localValidation: {
          ...localValidation,
          touchedFields: Array.from(new Set([...state.localValidation.touchedFields, action.field]))
        },
        reviewState: { ...state.reviewState, status: "dirty", errorMessage: null },
        uiState: { ...state.uiState, submitted: false, warnConfirmationPending: false }
      };
    }
    case "setReviewStarted":
      return {
        ...state,
        reviewState: {
          ...state.reviewState,
          status: "validating",
          activeClientRequestId: action.clientRequestId,
          errorMessage: null
        }
      };
    case "setValidationResult": {
      const hasBlock = action.result.alerts.some((alert) => alert.type === "BLOCK");
      return {
        ...state,
        validationResult: action.result,
        reviewState: {
          status: "valid",
          lastReviewedAt: new Date().toISOString(),
          lastReviewedHash: action.hash,
          activeClientRequestId: null,
          errorMessage: null
        },
        uiState: { ...state.uiState, submissionBlocked: hasBlock, warnConfirmationPending: false }
      };
    }
    case "setReviewError":
      return {
        ...state,
        reviewState: { ...state.reviewState, status: "error", activeClientRequestId: null, errorMessage: action.message }
      };
    case "markStale":
      return { ...state, reviewState: { ...state.reviewState, status: "stale" } };
    case "toggleSidebar":
      return { ...state, uiState: { ...state.uiState, sidebarOpen: action.open ?? !state.uiState.sidebarOpen } };
    case "submitAttempted": {
      const warnOnly = state.validationResult.summary.warnCount > 0 && state.validationResult.summary.blockCount === 0;
      if (state.uiState.submissionBlocked) {
        return { ...state, uiState: { ...state.uiState, submitAttempted: true, submitted: false } };
      }
      if (warnOnly && !state.uiState.warnConfirmationPending) {
        return { ...state, uiState: { ...state.uiState, submitAttempted: true, warnConfirmationPending: true } };
      }
      return { ...state, uiState: { ...state.uiState, submitAttempted: true, warnConfirmationPending: false, submitted: true } };
    }
    default:
      return state;
  }
}

export function DischargeFormProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <DischargeFormContext.Provider value={value}>{children}</DischargeFormContext.Provider>;
}

export function useDischargeForm() {
  const context = useContext(DischargeFormContext);
  if (!context) throw new Error("useDischargeForm must be used within DischargeFormProvider");
  return context;
}
