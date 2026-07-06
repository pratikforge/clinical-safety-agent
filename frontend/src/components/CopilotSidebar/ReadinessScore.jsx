import { useDischargeForm } from "../../context/DischargeFormContext.jsx";
import { scoreBand } from "../../utils/severity.js";

export default function ReadinessScore() {
  const { state } = useDischargeForm();
  const score = state.validationResult.readinessScore;
  return (
    <section className={`readiness-score ${scoreBand(score)}`} aria-label="Readiness score">
      <span>Readiness</span>
      <strong>{score ?? "--"}</strong>
      <p>{state.validationResult.llmStatus === "unavailable" ? "Rules complete, advisory LLM unavailable" : `LLM status: ${state.validationResult.llmStatus}`}</p>
    </section>
  );
}
