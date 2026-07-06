import { useState, useRef, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { DischargeFormProvider, useDischargeForm } from "./context/DischargeFormContext.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import StatusBanner from "./components/common/StatusBanner.jsx";
import PatientHeader from "./components/MockEHR/PatientHeader.jsx";
import PatientSelector from "./components/MockEHR/PatientSelector.jsx";
import DischargeForm from "./components/MockEHR/DischargeForm.jsx";
import SidebarContainer from "./components/CopilotSidebar/SidebarContainer.jsx";

function AppContent() {
  const { state, dispatch } = useDischargeForm();
  
  // Draggable logic for the extension trigger
  const [triggerY, setTriggerY] = useState(window.innerHeight / 2);
  const dragRef = useRef(false);
  const startY = useRef(0);

  useEffect(() => {
    const handleResize = () => setTriggerY(prev => Math.min(prev, window.innerHeight - 50));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePointerDown = (e) => {
    dragRef.current = true;
    startY.current = e.clientY;
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    const clampedY = Math.max(24, Math.min(e.clientY, window.innerHeight - 24));
    setTriggerY(clampedY);
  };

  const handlePointerUp = (e) => {
    dragRef.current = false;
    e.target.releasePointerCapture(e.pointerId);
    // If it was just a tiny click and not a drag, open the sidebar
    if (Math.abs(e.clientY - startY.current) < 5) {
      dispatch({ type: "toggleSidebar", open: true });
    }
  };

  return (
    <div className={`app-shell ${!state.uiState.sidebarOpen ? "sidebar-closed" : ""}`}>
      <main className="ehr-workspace" aria-label="Mock EHR discharge planner">
        <StatusBanner />
        <PatientSelector />
        <PatientHeader />
        <DischargeForm />
      </main>
      <SidebarContainer />
      {!state.uiState.sidebarOpen && (
        <button 
          className="extension-trigger" 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ top: triggerY }}
          aria-label="Open Copilot"
        >
          <div className="brand-logo">
            <ShieldCheck size={20} strokeWidth={2.5} color="#312e81" />
          </div>
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
