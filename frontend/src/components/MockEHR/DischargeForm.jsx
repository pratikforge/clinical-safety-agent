import { useDischargeForm } from "../../context/DischargeFormContext.jsx";
import { FIELD_OPTIONS } from "../../utils/fieldConfig.js";

function Field({ id, label, children, error }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? <span className="field-error">{error.message}</span> : null}
    </div>
  );
}

export default function DischargeForm() {
  const { state, dispatch } = useDischargeForm();
  const { formData, localValidation } = state;
  const errorFor = (field) => localValidation.errors.find((error) => error.field === field);
  const setField = (field, value) => dispatch({ type: "updateField", field, value });

  return (
    <form className="discharge-form">
      <fieldset>
        <legend>Discharge Destination</legend>
        <Field id="dischargeDate" label="Discharge date" error={errorFor("dischargeDate")}>
          <input id="dischargeDate" type="date" value={formData.dischargeDate} onChange={(event) => setField("dischargeDate", event.target.value)} />
        </Field>
        <Field id="dischargeStatus" label="Discharge status">
          <select id="dischargeStatus" value={formData.dischargeStatus} onChange={(event) => setField("dischargeStatus", event.target.value)}>
            {FIELD_OPTIONS.dischargeStatus.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
        <Field id="destination" label="Destination">
          <select id="destination" value={formData.destination} onChange={(event) => setField("destination", event.target.value)}>
            {FIELD_OPTIONS.destination.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
        <Field id="destinationAddress" label="Destination address" error={errorFor("destinationAddress")}>
          <input id="destinationAddress" value={formData.destinationAddress} onChange={(event) => setField("destinationAddress", event.target.value)} />
        </Field>
        <Field id="stairsAtHome" label="Stairs at home">
          <select id="stairsAtHome" value={formData.stairsAtHome} onChange={(event) => setField("stairsAtHome", event.target.value)}>
            {FIELD_OPTIONS.stairsAtHome.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
        <label className="check-row" htmlFor="livesAlone">
          <input id="livesAlone" type="checkbox" checked={formData.livesAlone} onChange={(event) => setField("livesAlone", event.target.checked)} />
          Lives alone
        </label>
      </fieldset>

      <fieldset>
        <legend>Caregiver and Transport</legend>
        <Field id="caregiverName" label="Caregiver name">
          <input id="caregiverName" value={formData.caregiverName} onChange={(event) => setField("caregiverName", event.target.value)} />
        </Field>
        <Field id="caregiverPhone" label="Caregiver phone">
          <input id="caregiverPhone" type="tel" value={formData.caregiverPhone} onChange={(event) => setField("caregiverPhone", event.target.value)} />
        </Field>
        <Field id="caregiverRelationship" label="Caregiver relationship">
          <input id="caregiverRelationship" value={formData.caregiverRelationship} onChange={(event) => setField("caregiverRelationship", event.target.value)} />
        </Field>
        <Field id="transportType" label="Transport type">
          <select id="transportType" value={formData.transportType} onChange={(event) => setField("transportType", event.target.value)}>
            {FIELD_OPTIONS.transportType.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
        <label className="check-row" htmlFor="caregiverAvailableOnDischarge">
          <input id="caregiverAvailableOnDischarge" type="checkbox" checked={formData.caregiverAvailableOnDischarge} onChange={(event) => setField("caregiverAvailableOnDischarge", event.target.checked)} />
          Caregiver available on discharge
        </label>
      </fieldset>

      <fieldset>
        <legend>Medication and Follow-Up</legend>
        <label className="check-row" htmlFor="medicationReconciliationComplete">
          <input id="medicationReconciliationComplete" type="checkbox" checked={formData.medicationReconciliationComplete} onChange={(event) => setField("medicationReconciliationComplete", event.target.checked)} />
          Medication reconciliation complete
        </label>
        <label className="check-row" htmlFor="insuranceVerified">
          <input id="insuranceVerified" type="checkbox" checked={formData.insuranceVerified} onChange={(event) => setField("insuranceVerified", event.target.checked)} />
          Insurance verified
        </label>
        <Field id="newMedications" label="New medications">
          <textarea id="newMedications" value={formData.newMedications} onChange={(event) => setField("newMedications", event.target.value)} />
        </Field>
        <Field id="followUpType" label="Follow-up type">
          <input id="followUpType" value={formData.followUpType} onChange={(event) => setField("followUpType", event.target.value)} />
        </Field>
        <Field id="followUpDate" label="Follow-up date">
          <input id="followUpDate" type="date" value={formData.followUpDate} onChange={(event) => setField("followUpDate", event.target.value)} />
        </Field>
        <label className="check-row" htmlFor="followUpBooked">
          <input id="followUpBooked" type="checkbox" checked={formData.followUpBooked} onChange={(event) => setField("followUpBooked", event.target.checked)} />
          Follow-up booked
        </label>
      </fieldset>

      <fieldset>
        <legend>Equipment, Services, and Signatures</legend>
        <Field id="equipmentNeeded" label="Equipment needed">
          <select id="equipmentNeeded" multiple value={formData.equipmentNeeded} onChange={(event) => setField("equipmentNeeded", Array.from(event.target.selectedOptions, (option) => option.value))}>
            {FIELD_OPTIONS.equipmentNeeded.map((option) => <option key={option}>{option}</option>)}
          </select>
        </Field>
        {["homeHealthOrdered", "communityServicesReferral", "physicianSignature", "socialWorkerSignature"].map((field) => (
          <label className="check-row" htmlFor={field} key={field}>
            <input id={field} type="checkbox" checked={formData[field]} onChange={(event) => setField(field, event.target.checked)} />
            {field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}
          </label>
        ))}
      </fieldset>
    </form>
  );
}
