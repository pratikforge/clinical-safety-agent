import { render } from "@testing-library/react";
import { useEffect } from "react";
import { DischargeFormProvider, useDischargeForm } from "../context/DischargeFormContext.jsx";

export function renderWithProvider(ui) {
  return render(<DischargeFormProvider>{ui}</DischargeFormProvider>);
}

export function StateSetter({ result }) {
  const { dispatch } = useDischargeForm();
  useEffect(() => {
    dispatch({ type: "setValidationResult", result, hash: "test" });
  }, [dispatch, result]);
  return null;
}

export const passResult = {
  requestId: "request-1",
  readinessScore: 95,
  llmStatus: "rules_only",
  alerts: [
    {
      type: "PASS",
      field: "dischargePlan",
      message: "No blocking discharge safety issues were found in the configured rules.",
      rule: "RULES_CLEAR",
      source: "rules"
    }
  ],
  summary: { blockCount: 0, warnCount: 0, passCount: 1, missingItemsCount: 0, unresolvedRiskCount: 0 }
};
