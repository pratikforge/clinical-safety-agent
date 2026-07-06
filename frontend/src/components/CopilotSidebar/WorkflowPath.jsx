import { CheckCircle2, Circle, AlertTriangle, XCircle, FileSearch, ShieldCheck, Scale, Cpu, Share2 } from "lucide-react";
import { useDischargeForm } from "../../context/DischargeFormContext.jsx";

const stepIcons = {
  parse_discharge_event: FileSearch,
  local_schema_check: CheckCircle2,
  security_screen: ShieldCheck,
  deterministic_safety_review: Scale,
  deterministic_router: Share2,
  allow_demo_submit_decision: CheckCircle2,
  blocked_decision: XCircle,
  warn_confirmation_decision: AlertTriangle,
  human_review_required_decision: XCircle
};

export default function WorkflowPath() {
  const { state } = useDischargeForm();
  const { validationResult, isSubmitting } = state;

  if (isSubmitting) {
    return (
      <div className="workflow-path">
        <h3>Agent Workflow</h3>
        <p className="loading-text">Agent analyzing discharge plan...</p>
      </div>
    );
  }

  if (!validationResult || !validationResult.workflowPath) {
    return null;
  }

  const path = validationResult.workflowPath;

  return (
    <div className="workflow-path">
      <h3>Agent Workflow</h3>
      <div className="workflow-timeline">
        {path.map((step, index) => {
          const isLast = index === path.length - 1;
          const Icon = stepIcons[step] || Circle;
          let colorClass = "step-neutral";
          
          if (isLast) {
             if (step.includes("allow")) colorClass = "step-success";
             else if (step.includes("warn")) colorClass = "step-warn";
             else if (step.includes("block") || step.includes("human")) colorClass = "step-error";
          }

          return (
            <div key={index} className={`workflow-step ${colorClass}`}>
              <div className="step-icon">
                <Icon size={16} />
              </div>
              <div className="step-content">
                <span className="step-name">{step.replace(/_/g, ' ')}</span>
              </div>
              {!isLast && <div className="step-connector" />}
            </div>
          );
        })}
      </div>
      <div className="workflow-decision">
        <strong>Final Decision:</strong> {validationResult.agentDecision?.replace(/_/g, ' ') || 'Unknown'}
        <span className="agent-mode">({validationResult.agentMode?.replace(/_/g, ' ') || 'rules only'})</span>
      </div>
    </div>
  );
}
