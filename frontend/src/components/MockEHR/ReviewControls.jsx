import { ShieldCheck, Send, PanelRightOpen } from "lucide-react";
import { useDischargeForm } from "../../context/DischargeFormContext.jsx";
import { useDischargeValidation } from "../../hooks/useDischargeValidation.js";

export default function ReviewControls() {
  const { state, dispatch } = useDischargeForm();
  const { startReview } = useDischargeValidation();
  const blocked = state.uiState.submissionBlocked;
  const validating = state.reviewState.status === "validating";

  return (
    <section className="review-controls" aria-label="Discharge review controls">
      <button type="button" className="secondary-button" aria-expanded={state.uiState.sidebarOpen} onClick={() => dispatch({ type: "toggleSidebar", open: true })}>
        <PanelRightOpen size={16} /> Copilot
      </button>
      <button type="button" onClick={() => startReview({ manual: true })} disabled={validating || !state.localValidation.isCompleteEnoughForReview}>
        <ShieldCheck size={16} /> {validating ? "Reviewing" : "Review Discharge"}
      </button>
      <button type="button" disabled={blocked} onClick={() => dispatch({ type: "submitAttempted" })}>
        <Send size={16} /> Submit Discharge
      </button>
      {blocked && state.uiState.submitAttempted ? <span className="field-error">Submission blocked by backend safety alerts.</span> : null}
      {state.uiState.warnConfirmationPending ? (
        <button type="button" className="secondary-button" onClick={() => dispatch({ type: "submitAttempted" })}>
          Confirm WARN-only submission
        </button>
      ) : null}
    </section>
  );
}
