import { useDischargeForm } from "../../context/DischargeFormContext.jsx";

export default function PatientHeader() {
  const { state } = useDischargeForm();
  const patient = state.patientSummary;
  if (!patient) {
    return <section className="patient-header" role="status">Select a synthetic patient record to load discharge planning.</section>;
  }
  return (
    <section className="patient-header" aria-label="Patient demographics">
      <div>
        <span className="label">Name</span>
        <strong>{patient.patientName}</strong>
      </div>
      <div>
        <span className="label">DOB</span>
        <strong>{patient.dateOfBirth}</strong>
      </div>
      <div>
        <span className="label">MRN</span>
        <strong>{patient.mrn}</strong>
      </div>
      <div>
        <span className="label">Location</span>
        <strong>{patient.location}</strong>
      </div>
      <p>{patient.note}</p>
    </section>
  );
}
