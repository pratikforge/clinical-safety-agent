import { useDischargeForm } from "../../context/DischargeFormContext.jsx";
import AlertItem from "./AlertItem.jsx";

export default function AlertList() {
  const { state } = useDischargeForm();
  const alerts = state.validationResult.alerts;
  return (
    <section className="alert-list" aria-live="polite" aria-label="Discharge safety alerts">
      <h3>Safety Alerts</h3>
      {alerts.length === 0 ? (
        <p className="empty-state">Complete the minimum discharge fields to run backend validation.</p>
      ) : (
        <ul>
          {alerts.map((alert) => <AlertItem key={`${alert.rule}-${alert.field}-${alert.message}`} alert={alert} />)}
        </ul>
      )}
    </section>
  );
}
