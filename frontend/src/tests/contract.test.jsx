import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import DischargeForm from "../components/MockEHR/DischargeForm.jsx";
import SidebarControls from "../components/CopilotSidebar/SidebarControls.jsx";
import { renderWithProvider } from "./testUtils.jsx";

afterEach(() => {
  vi.restoreAllMocks();
});

test("review request includes clientRequestId, patientId, and caregiverRelationship", async () => {
  const user = userEvent.setup();
  global.fetch = vi.fn().mockImplementation(async (_url, options) => {
    const body = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({
        requestId: body.clientRequestId,
        readinessScore: 95,
        llmStatus: "rules_only",
        alerts: [{ type: "PASS", field: "dischargePlan", message: "Clear", rule: "RULES_CLEAR", source: "rules" }],
        summary: { blockCount: 0, warnCount: 0, passCount: 1, missingItemsCount: 0, unresolvedRiskCount: 0 }
      })
    };
  });

  renderWithProvider(
    <>
      <DischargeForm />
      <SidebarControls />
    </>
  );

  await user.type(screen.getByLabelText(/Discharge date/i), "2026-07-07");
  await user.type(screen.getByLabelText(/Destination address/i), "10 Demo Street");
  await user.type(screen.getByLabelText(/Caregiver relationship/i), "Adult child");
  await user.click(screen.getByRole("button", { name: /Review Discharge/i }));

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  const body = JSON.parse(global.fetch.mock.calls[0][1].body);
  expect(body.clientRequestId).toEqual(expect.any(String));
  expect(body.patientId).toBe("MRN-300");
  expect(body.formData.caregiverRelationship).toBe("Adult child");
});
