import { useDischargeForm } from "../../context/DischargeFormContext.jsx";
import { mockPatients } from "../../data/mockPatients.js";

export default function PatientSelector() {
  const { state, dispatch } = useDischargeForm();
  return (
    <section className="ehr-section patient-selector">
      <label htmlFor="patientId">Patient</label>
      <select id="patientId" value={state.selectedPatientId} onChange={(event) => dispatch({ type: "selectPatient", patientId: event.target.value })}>
        {Object.values(mockPatients).map((patient) => (
          <option key={patient.mrn} value={patient.mrn}>
            {patient.patientName} ({patient.mrn})
          </option>
        ))}
      </select>
    </section>
  );
}
