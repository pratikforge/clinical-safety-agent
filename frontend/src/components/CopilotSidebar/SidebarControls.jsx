import { ShieldCheck, Send } from "lucide-react";
import { useDischargeForm } from "../../context/DischargeFormContext.jsx";
import { useDischargeValidation } from "../../hooks/useDischargeValidation.js";

export default function SidebarControls() {
  const { state, dispatch } = useDischargeForm();
  const { startReview } = useDischargeValidation();
  const blocked = state.uiState.submissionBlocked;
  const validating = state.reviewState.status === "validating";

  return (
    <section className="review-controls" aria-label="Discharge review controls">
      <button type="button" onClick={() => startReview({ manual: true })} disabled={validating || !state.localValidation.isCompleteEnoughForReview}>
        <ShieldCheck size={16} /> {validating ? "Reviewing" : "Review Discharge"}
      </button>
      {!state.uiState.overrideActive && (
        <button type="button" disabled={blocked} onClick={() => dispatch({ type: "submitAttempted" })}>
          <Send size={16} /> Submit Discharge
        </button>
      )}
      
      {blocked && !state.uiState.overrideActive && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
          {state.uiState.submitAttempted && <span className="field-error">Submission blocked by backend safety alerts.</span>}
          <button type="button" style={{ backgroundColor: "var(--danger)", color: "white" }} onClick={() => dispatch({ type: "initiateOverride" })}>
            Break the Glass (Override)
          </button>
        </div>
      )}

      {state.uiState.overrideActive && (
        <div style={{ border: "1px solid var(--border)", padding: "1rem", borderRadius: "8px", marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
          <h4 style={{ margin: 0, color: "var(--danger)" }}>Admin Override Required</h4>
          <input 
            type="text" 
            placeholder="Admin ID (e.g., ADM-991)" 
            value={state.uiState.overrideAdminId}
            onChange={(e) => dispatch({ type: "updateOverrideMetadata", field: "overrideAdminId", value: e.target.value })}
            style={{ width: "100%", padding: "0.5rem" }}
          />
          <textarea 
            placeholder="Legal justification for overriding the safety block..."
            value={state.uiState.overrideReason}
            onChange={(e) => dispatch({ type: "updateOverrideMetadata", field: "overrideReason", value: e.target.value })}
            style={{ width: "100%", padding: "0.5rem", minHeight: "80px" }}
          />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="button" style={{ backgroundColor: "var(--danger)", color: "white" }} onClick={async () => {
              await startReview({ override: true });
              dispatch({ type: "submitAttempted" });
            }}>
              Confirm Override
            </button>
            <button type="button" className="secondary-button" onClick={() => dispatch({ type: "cancelOverride" })}>Cancel</button>
          </div>
        </div>
      )}

      {state.uiState.warnConfirmationPending && !state.uiState.overrideActive ? (
        <button type="button" className="secondary-button" onClick={() => dispatch({ type: "submitAttempted" })}>
          Confirm WARN-only submission
        </button>
      ) : null}
    </section>
  );
}
