import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useDischargeForm } from "../../context/DischargeFormContext.jsx";

export default function StatusBanner() {
  const { state } = useDischargeForm();
  const { reviewState, uiState } = state;
  if (uiState.submitted) {
    return (
      <div className="status-banner status-success" role="status">
        <CheckCircle2 size={18} /> Demo discharge submitted.
      </div>
    );
  }
  if (reviewState.status === "error") {
    return (
      <div className="status-banner status-error" role="status">
        <AlertTriangle size={18} /> {reviewState.errorMessage}
      </div>
    );
  }
  if (reviewState.status === "validating" || reviewState.status === "stale") {
    return (
      <div className="status-banner status-info" role="status">
        <Info size={18} /> Validation is running. Previous results remain visible until the current review returns.
      </div>
    );
  }
  return (
    <div className="status-banner status-info" role="status">
      <Info size={18} /> Synthetic patient data only. Backend rules own readiness scoring and block decisions.
    </div>
  );
}
