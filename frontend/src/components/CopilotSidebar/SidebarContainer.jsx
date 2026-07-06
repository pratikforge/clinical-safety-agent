import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDischargeForm } from "../../context/DischargeFormContext.jsx";
import AlertList from "./AlertList.jsx";
import ReadinessScore from "./ReadinessScore.jsx";
import SummaryMetrics from "./SummaryMetrics.jsx";
import WorkflowPath from "./WorkflowPath.jsx";

export default function SidebarContainer() {
  const { state, dispatch } = useDischargeForm();
  const closeRef = useRef(null);

  useEffect(() => {
    if (state.uiState.sidebarOpen && document.activeElement?.textContent === "Copilot") {
      closeRef.current?.focus();
    }
  }, [state.uiState.sidebarOpen]);

  return (
    <aside className={`copilot-sidebar ${state.uiState.sidebarOpen ? "is-open" : ""}`} aria-label="Copilot discharge safety sidebar">
      <header>
        <div>
          <p>Social Services Copilot</p>
          <h2>Discharge Safety</h2>
        </div>
        <button ref={closeRef} type="button" className="icon-button" aria-label="Close copilot sidebar" aria-expanded={state.uiState.sidebarOpen} onClick={() => dispatch({ type: "toggleSidebar", open: false })}>
          <X size={18} />
        </button>
      </header>
      <ReadinessScore />
      <WorkflowPath />
      <SummaryMetrics />
      <AlertList />
    </aside>
  );
}
