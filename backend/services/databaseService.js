const patients = require("../db/mockDatabase.json");

function getPatientById(patientId) {
  return patients.find((patient) => patient.mrn === patientId) || null;
}

function listPatients() {
  return patients;
}

module.exports = { getPatientById, listPatients };
