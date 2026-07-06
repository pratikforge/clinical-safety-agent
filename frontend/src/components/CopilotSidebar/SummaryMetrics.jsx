import { useDischargeForm } from "../../context/DischargeFormContext.jsx";

export default function SummaryMetrics() {
  const { summary } = useDischargeForm().state.validationResult;
  return (
    <section className="summary-metrics" aria-label="Alert summary">
      <div><span>Blocks</span><strong>{summary.blockCount}</strong></div>
      <div><span>Warnings</span><strong>{summary.warnCount}</strong></div>
      <div><span>Passes</span><strong>{summary.passCount}</strong></div>
      <div><span>Missing</span><strong>{summary.missingItemsCount}</strong></div>
    </section>
  );
}
