# Hospital Discharge Planning: Field-by-Field Spec & Workflow
*(Research generated via Perplexity Deep Dive)*

## 1. The Incumbent Software Systems
Hospitals use massive Electronic Health Records (EHRs) like **Epic (Grand Central)**, **Cerner (PowerChart)**, and **Allscripts**. While excellent at clinical data (labs, vitals), they are notoriously difficult for logistical and social data, forcing social workers to jump through 15+ tabs to verify a single discharge.

## 2. Field-by-Field Discharge Form Spec (For AI Copilot)

An AI Copilot overlay should act as a "Second Eye," scanning the following required fields and applying validation logic before a discharge is finalized.

### A. Patient & Administrative Data
- **Patient Identity:** Must match chart.
- **Discharge Date & Status:** Must be filled and valid.
- **Discharge Destination:** Crucial. The AI must cross-reference this destination (e.g., "Home") with the patient's mobility, oxygen needs, and caregiver status. 
  - *AI Check:* If destination is "Home" but clinical notes say "requires 2-person assist for stairs" and patient lives in a 3rd-floor walk-up, AI escalates to Clinical Review.

### B. Medical & Medication Data
- **Medication Reconciliation:** Ensure all prescribed drugs are affordable and accessible.
  - *AI Check:* Scan for Tier 4/specialty drugs. Flag if no insurance verification is present.
- **Follow-up Appointments:** Must be booked, not just recommended.
  - *AI Check:* If "Cardiology Follow-up" is checked, AI searches for an actual calendar booking.

### C. Social & Logistical Data
- **Transportation:** Match transport type to clinical needs.
  - *AI Check:* If patient requires 2L Oxygen, flag if standard taxi/Uber is booked instead of paratransit.
- **Home Equipment & Services:** Wheelchairs, home nurses, etc.
- **Caregiver Info:** Name, contact, and confirmation they are available.

## 3. Recommended AI Control Logic
1. **Block Finalization:** If identity, date, destination, medication reconciliation, or signature fields are incomplete.
2. **Escalate to Social Work:** If patient needs transport, home equipment, or community services that are not confirmed.
3. **Escalate to Clinical Review:** If discharge destination is home, but mobility, oxygen, or supervision needs are unaddressed.
4. **Log Overrides:** Log every override so staff can audit why the copilot allowed a discharge despite a warning.

## 4. Optional "Second-Eye" Dashboards
The Copilot should add derived AI fields to the UI:
*   **Discharge Readiness Score**
*   **Missing-Items Count**
*   **Unresolved-Risk Count**
*   **Safety Confidence Score** (Green/Yellow/Red status blocking only the highest-risk failures).
