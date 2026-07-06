# Hospital Discharge Planning: Workflow & Software Research

*This research document outlines the exact standard operating procedures (SOPs), legacy software systems, and data bottlenecks that hospital social workers face during patient transitions. This data serves as the foundation for our "Social Services Copilot" AI.*

---

## 1. The Incumbent Software Systems
Hospitals do not use basic web forms; they rely on massive, monolithic Electronic Health Record (EHR) systems. The big three are:
*   **Epic (Grand Central & EpicCare):** The industry leader. Features "Discharge Watchlists" and embedded capacity management.
*   **Cerner (Oracle Health):** Uses the "PowerChart" interface to automate tasks and track active orders.
*   **Allscripts (Altera):** Highly focused on multi-specialty interoperability.

**The Problem with Incumbents:** While these systems track *clinical* data (lab results, diagnoses) exceptionally well, they are famously clunky for *logistical and social* data. A social worker often has to open 15 different tabs within Epic just to verify a patient's housing address, their insurance status for an ambulance, and their ability to afford a new prescription.

---

## 2. The Social Worker's Step-by-Step Workflow
While nurses handle IVs and doctors handle diagnoses, social workers are responsible for the **Social Determinants of Health (SDOH)**. If the patient fails here, they bounce back to the hospital.

### Step 1: Early Assessment & Barrier Screening
*   **Action:** The social worker reviews the intake forms the day the patient arrives.
*   **Checks:** Does the patient have a home to go to? Do they have stairs they can't climb? Are they facing financial ruin?
*   **Data Source:** Unstructured doctor's notes, intake SDOH questionnaires.

### Step 2: Medication Reconciliation (The Deadliest Bottleneck)
*   **Action:** While pharmacists ensure the clinical safety of the drug list, the social worker ensures *logistical reality*.
*   **Checks:** Can the patient afford the $500/month blood thinner? If not, the social worker must find grant programs or switch the script.
*   **The Error Risk:** If the social worker fails to notice a financial barrier buried in page 4 of a clinical note, the patient goes home, doesn't buy the medicine, and has another heart attack.

### Step 3: Transportation & Logistics Coordination
*   **Action:** Organizing Non-Emergency Medical Transportation (NEMT).
*   **Checks:** Is the patient on oxygen? If so, they cannot take an Uber; they need a specialized paratransit van. 
*   **The Error Risk:** Copy-pasting the wrong receiving facility address, or booking a standard taxi for a wheelchair-bound patient.

### Step 4: The Final Transition Packet (Discharge Summary)
*   **Action:** Compiling the "Transition of Care" document for the receiving facility (e.g., a rehab center).
*   **Checks:** Ensuring all clinical instructions, medication lists, and follow-up appointments are perfectly aligned.

---

## 3. Where Our AI Copilot Fits In
The Copilot will not *replace* Epic or Cerner. Instead, it will be an **Ambient Overlay** (a SMART on FHIR app concept) that watches the social worker's workflow and cross-references data in real-time.

*   **Feature A (SDOH Verification):** The social worker books an Uber. The AI flags: *"Warning: Dr. Smith's note states the patient requires 2L of Oxygen. An Uber cannot accommodate this. Switch to Paratransit."*
*   **Feature B (Address Verification):** The AI cross-references the Discharge form against the original Intake form to catch copy-paste address errors.
*   **Feature C (Medication Affordability):** The AI scans the discharge drug list, detects a Tier 4 specialty drug, and prompts the social worker to verify insurance coverage before the patient leaves the building.
