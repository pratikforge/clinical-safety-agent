import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import DischargeForm from "../components/MockEHR/DischargeForm.jsx";
import SidebarControls from "../components/CopilotSidebar/SidebarControls.jsx";
import StatusBanner from "../components/common/StatusBanner.jsx";
import { useDischargeValidation } from "../hooks/useDischargeValidation.js";
import { renderWithProvider } from "./testUtils.jsx";

function AutoReview() {
  useDischargeValidation();
  return null;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

test("debounced ambient validation fires at most one request for rapid changes", async () => {
  vi.useFakeTimers();
  global.fetch = vi.fn().mockImplementation(async (_url, options) => {
    const body = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({
        requestId: body.clientRequestId,
        readinessScore: 84,
        llmStatus: "rules_only",
        alerts: [{ type: "WARN", field: "followUpBooked", message: "Follow-up warning", rule: "FOLLOWUP_NOT_BOOKED", source: "rules" }],
        summary: { blockCount: 0, warnCount: 1, passCount: 0, missingItemsCount: 0, unresolvedRiskCount: 1 }
      })
    };
  });

  renderWithProvider(
    <>
      <AutoReview />
      <DischargeForm />
    </>
  );

  fireEvent.change(screen.getByLabelText(/Discharge date/i), { target: { value: "2026-07-07" } });
  fireEvent.change(screen.getByLabelText(/Destination address/i), { target: { value: "10 Demo Street" } });
  const followUp = screen.getByLabelText(/Follow-up type/i);
  for (const value of ["a", "ab", "abc", "abcd", "abcde", "abcdef", "abcdefg", "abcdefgh", "abcdefghi", "abcdefghij"]) {
    fireEvent.change(followUp, { target: { value } });
  }
  await act(async () => {
    vi.advanceTimersByTime(800);
    await Promise.resolve();
  });
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test("intentional cancellation does not show error banner", async () => {
  const user = userEvent.setup();
  global.fetch = vi.fn().mockImplementation(
    () =>
      new Promise((_resolve, reject) => {
        const error = new DOMException("Aborted", "AbortError");
        setTimeout(() => reject(error), 0);
      })
  );
  renderWithProvider(
    <>
      <StatusBanner />
      <DischargeForm />
      <SidebarControls />
    </>
  );
  await user.type(screen.getByLabelText(/Discharge date/i), "2026-07-07");
  await user.type(screen.getByLabelText(/Destination address/i), "10 Demo Street");
  await user.click(screen.getByRole("button", { name: /Review Discharge/i }));
  await waitFor(() => expect(screen.queryByText(/unavailable/i)).not.toBeInTheDocument());
});
