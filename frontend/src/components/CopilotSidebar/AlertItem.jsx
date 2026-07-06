import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { severityClass } from "../../utils/severity.js";

function Icon({ type }) {
  if (type === "BLOCK") return <AlertOctagon size={18} aria-hidden="true" />;
  if (type === "WARN") return <AlertTriangle size={18} aria-hidden="true" />;
  if (type === "PASS") return <CheckCircle2 size={18} aria-hidden="true" />;
  return <Info size={18} aria-hidden="true" />;
}

export default function AlertItem({ alert }) {
  return (
    <li className={`alert-item ${severityClass(alert.type)}`}>
      <Icon type={alert.type} />
      <div>
        <strong>{alert.type}</strong>
        <p>{alert.message}</p>
        <span>{alert.field} · {alert.rule} · {alert.source}</span>
      </div>
    </li>
  );
}
