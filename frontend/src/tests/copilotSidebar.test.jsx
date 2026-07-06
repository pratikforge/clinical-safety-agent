import { screen } from "@testing-library/react";
import { expect, test } from "vitest";
import AlertList from "../components/CopilotSidebar/AlertList.jsx";
import ReadinessScore from "../components/CopilotSidebar/ReadinessScore.jsx";
import SummaryMetrics from "../components/CopilotSidebar/SummaryMetrics.jsx";
import { renderWithProvider, StateSetter } from "./testUtils.jsx";

function resultWith(score, alerts) {
  return {
    requestId: "request",
    readinessScore: score,
    llmStatus: "rules_only",
    alerts,
    summary: {
      blockCount: alerts.filter((alert) => alert.type === "BLOCK").length,
      warnCount: alerts.filter((alert) => alert.type === "WARN").length,
      passCount: alerts.filter((alert) => alert.type === "PASS").length,
      missingItemsCount: 0,
      unresolvedRiskCount: alerts.filter((alert) => alert.type !== "PASS").length
    }
  };
}

test("renders BLOCK, WARN, and PASS alert labels and messages", async () => {
  const alerts = [
    { type: "BLOCK", field: "transportType", message: "Transport blocked", rule: "OXYGEN_TRANSPORT_MISMATCH", source: "rules" },
    { type: "WARN", field: "insuranceVerified", message: "Insurance warning", rule: "HIGH_TIER_MED_INSURANCE_UNVERIFIED", source: "rules" },
    { type: "PASS", field: "dischargePlan", message: "Rules clear", rule: "RULES_CLEAR", source: "rules" }
  ];
  renderWithProvider(
    <>
      <StateSetter result={resultWith(42, alerts)} />
      <AlertList />
      <SummaryMetrics />
    </>
  );
  expect(await screen.findByText("Transport blocked")).toBeInTheDocument();
  expect(screen.getByText("Insurance warning")).toBeInTheDocument();
  expect(screen.getByText("Rules clear")).toBeInTheDocument();
  expect(screen.getByText("Blocks")).toBeInTheDocument();
});

test.each([
  [42, "score-block"],
  [72, "score-warn"],
  [95, "score-pass"]
])("readiness score %s uses expected band", async (score, className) => {
  const { container } = renderWithProvider(
    <>
      <StateSetter result={resultWith(score, [])} />
      <ReadinessScore />
    </>
  );
  expect(await screen.findByText(String(score))).toBeInTheDocument();
  expect(container.querySelector(".readiness-score")).toHaveClass(className);
});
