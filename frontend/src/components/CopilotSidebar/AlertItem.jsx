import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { severityClass } from "../../utils/severity.js";

function Icon({ type }) {
  if (type === "BLOCK") return <AlertOctagon size={18} aria-hidden="true" />;
  if (type === "WARN") return <AlertTriangle size={18} aria-hidden="true" />;
  if (type === "PASS") return <CheckCircle2 size={18} aria-hidden="true" />;
  return <Info size={18} aria-hidden="true" />;
}

/** Converts SCREAMING_SNAKE_CASE and camelCase to readable Title Case */
function formatLabel(str) {
  if (!str) return "";
  return str
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AlertItem({ alert }) {
  return (
    <li className={`alert-item ${severityClass(alert.type)}`}>
      <Icon type={alert.type} />
      <div>
        <strong>{alert.type}</strong>
        <p>{alert.message}</p>
        <span>{formatLabel(alert.field)} · {formatLabel(alert.rule)} · {formatLabel(alert.source)}</span>
      </div>
    </li>
  );
}
