const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:3001";

export async function validateDischarge({ clientRequestId, patientId, formData, signal }) {
  const response = await fetch(`${API_ORIGIN}/api/validate-discharge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientRequestId, patientId, formData }),
    signal
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Validation service returned an unreadable response.");
  }

  if (!response.ok) {
    const details = Array.isArray(payload.details) ? ` ${payload.details.map((item) => item.message).join(" ")}` : "";
    throw new Error(`${payload.error || "Validation service unavailable. Please try again."}${details}`);
  }

  if (!payload || typeof payload.requestId !== "string" || !Array.isArray(payload.alerts) || !payload.summary) {
    throw new Error("Validation service returned an unexpected response.");
  }

  return payload;
}
