import { DischargeFormProvider, useDischargeForm } from "./context/DischargeFormContext.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import StatusBanner from "./components/common/StatusBanner.jsx";
import PatientHeader from "./components/MockEHR/PatientHeader.jsx";
import PatientSelector from "./components/MockEHR/PatientSelector.jsx";
import DischargeForm from "./components/MockEHR/DischargeForm.jsx";
import ReviewControls from "./components/MockEHR/ReviewControls.jsx";
import SidebarContainer from "./components/CopilotSidebar/SidebarContainer.jsx";

function AppContent() {
  const { state, dispatch } = useDischargeForm();
  return (
    <div className={`app-shell ${!state.uiState.sidebarOpen ? "sidebar-closed" : ""}`}>
      <main className="ehr-workspace" aria-label="Mock EHR discharge planner">
        <StatusBanner />
        <PatientSelector />
        <PatientHeader />
        <DischargeForm />
        <ReviewControls />
      </main>
      <SidebarContainer />
      {!state.uiState.sidebarOpen && (
        <button className="extension-trigger" onClick={() => dispatch({ type: "toggleSidebar", open: true })} aria-label="Open Copilot">
          <span>C</span>
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <DischargeFormProvider>
        <AppContent />
      </DischargeFormProvider>
    </ErrorBoundary>
  );
}
