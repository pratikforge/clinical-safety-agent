import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import DischargeForm from "../components/MockEHR/DischargeForm.jsx";
import { useDischargeForm } from "../context/DischargeFormContext.jsx";
import { requestFieldNames } from "../utils/fieldConfig.js";
import { renderWithProvider } from "./testUtils.jsx";

function FieldProbe() {
  const { state } = useDischargeForm();
  return <output aria-label="form-data">{JSON.stringify(state.formData)}</output>;
}

test("renders every editable request field and updates context", async () => {
  const user = userEvent.setup();
  renderWithProvider(
    <>
      <DischargeForm />
      <FieldProbe />
    </>
  );

  await user.type(screen.getByLabelText(/Caregiver relationship/i), "Neighbor");
  const data = JSON.parse(screen.getByLabelText("form-data").textContent);
  expect(data.caregiverRelationship).toBe("Neighbor");
  for (const fieldName of requestFieldNames) {
    expect(data).toHaveProperty(fieldName);
  }
});

test("does not execute user-entered markup in text fields", async () => {
  const user = userEvent.setup();
  const { container } = renderWithProvider(<DischargeForm />);
  await user.type(screen.getByLabelText(/New medications/i), "<img src=x onerror=alert(1)>");
  expect(container.querySelector("img")).toBeNull();
  expect(container.querySelector("[onerror]")).toBeNull();
});
