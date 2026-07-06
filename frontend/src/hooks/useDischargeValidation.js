import { useCallback, useEffect, useRef } from "react";
import { useDischargeForm } from "../context/DischargeFormContext.jsx";
import { validateDischarge } from "../services/apiClient.js";
import { stableHash } from "../utils/stableHash.js";
import { useDebounce } from "./useDebounce.js";

export function useDischargeValidation() {
  const { state, dispatch } = useDischargeForm();
  const abortRef = useRef(null);
  const formHash = stableHash(state.formData);
  const debouncedHash = useDebounce(formHash, 700);

  const startReview = useCallback(
    async ({ manual = false } = {}) => {
      if (!state.selectedPatientId || !state.localValidation.isCompleteEnoughForReview) return;
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const clientRequestId = crypto.randomUUID();
      dispatch({ type: manual ? "setReviewStarted" : "markStale" });
      dispatch({ type: "setReviewStarted", clientRequestId });

      try {
        const result = await validateDischarge({
          clientRequestId,
          patientId: state.selectedPatientId,
          formData: state.formData,
          signal: controller.signal
        });
        if (result.requestId !== clientRequestId) return;
        dispatch({ type: "setValidationResult", result, hash: stableHash(state.formData) });
      } catch (error) {
        if (error.name === "AbortError") return;
        dispatch({ type: "setReviewError", message: error.message || "Validation service unavailable. Please try again." });
      }
    },
    [dispatch, state.formData, state.localValidation.isCompleteEnoughForReview, state.selectedPatientId]
  );

  useEffect(() => {
    if (state.reviewState.status !== "dirty") return;
    startReview({ manual: false });
    return () => {};
  }, [debouncedHash]);

  return { startReview };
}
