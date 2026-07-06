import urllib.request
import json
import time

def call_daemon(session, action, args):
    req_body = {
        "session": session,
        "action": action,
        "args": args
    }
    req = urllib.request.Request(
        "http://127.0.0.1:10086/command",
        data=json.dumps(req_body).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        response = urllib.request.urlopen(req)
        return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print(f"Error calling {action}: {e}")
        return None

def test_scenario(scenario_id, patient_id, form_data):
    print(f"--- Starting {scenario_id} ---")
    session = scenario_id
    
    # Navigate
    res = call_daemon(session, "navigate", {"url": "http://localhost:5173", "newTab": True, "group_title": scenario_id})
    print(f"Navigate: {res}")
    time.sleep(2)
    
    # Use javascript to set form fields and trigger React events
    # We will loop over form_data and dispatch change events. 
    # Or even better, let's just evaluate a script that sets the inputs since React sometimes needs specific native value setters.
    
    # For a React app, changing input values programmatically requires getting the native setter.
    js_code = f"""
    (() => {{
        const patientSelect = document.querySelector('select[name="patientId"]');
        if (patientSelect) {{
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
            nativeInputValueSetter.call(patientSelect, "{patient_id}");
            patientSelect.dispatchEvent(new Event("change", {{ bubbles: true }}));
        }}
        return true;
    }})()
    """
    call_daemon(session, "evaluate", {"code": js_code})
    time.sleep(1) # wait for patient load if any
    
    # We will build a larger JS script to fill all form_data
    form_data_str = json.dumps(form_data)
    js_fill_code = f"""
    (() => {{
        const formData = {form_data_str};
        for (const [key, value] of Object.entries(formData)) {{
            const el = document.querySelector(`[name="${{key}}"]`);
            if (el) {{
                if (el.type === 'checkbox') {{
                    const nativeCheckboxSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "checked").set;
                    nativeCheckboxSetter.call(el, value);
                    el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }} else if (el.tagName === 'SELECT') {{
                    // Handle multi-select for equipmentNeeded
                    if (el.multiple && Array.isArray(value)) {{
                        Array.from(el.options).forEach(opt => {{
                            opt.selected = value.includes(opt.value);
                        }});
                        el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                    }} else {{
                        const nativeSelectSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
                        nativeSelectSetter.call(el, value);
                        el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                    }}
                }} else {{
                    // text, textarea, etc
                    const prototype = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(prototype, "value").set;
                    nativeInputValueSetter.call(el, value);
                    el.dispatchEvent(new Event('input', {{ bubbles: true }}));
                    el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }}
            }}
        }}
        return true;
    }})()
    """
    call_daemon(session, "evaluate", {"code": js_fill_code})
    time.sleep(1)
    
    # Find Review Discharge button
    # It might be button with text "Review Discharge"
    js_click_code = """
    (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const reviewBtn = buttons.find(b => b.textContent.includes('Review Discharge'));
        if (reviewBtn) {
            reviewBtn.click();
            return true;
        }
        return false;
    })()
    """
    call_daemon(session, "evaluate", {"code": js_click_code})
    time.sleep(1)
    
    # Snapshot
    snapshot = call_daemon(session, "snapshot", {})
    return snapshot

scenarios = [
    {
        "id": "tricky_03_confused_patient_home_health_loophole",
        "patientId": "MRN-300",
        "formData": {"dischargeDate": "2026-07-09", "dischargeStatus": "Routine", "destination": "Home", "destinationAddress": "88 Synthetic Patient Road", "livesAlone": True, "stairsAtHome": "6+ steps", "caregiverName": "Margaret Reid", "caregiverPhone": "555-222-3333", "caregiverRelationship": "Daughter", "caregiverAvailableOnDischarge": True, "transportType": "Wheelchair Van", "medicationReconciliationComplete": True, "newMedications": "", "insuranceVerified": True, "followUpType": "Pulmonology", "followUpDate": "2026-07-16", "followUpBooked": True, "equipmentNeeded": ["Wheelchair", "Oxygen"], "homeHealthOrdered": True, "communityServicesReferral": True, "physicianSignature": True, "socialWorkerSignature": True}
    },
    {
        "id": "tricky_04_elevator_saves_the_day",
        "patientId": "MRN-300",
        "formData": {"dischargeDate": "2026-07-09", "dischargeStatus": "Routine", "destination": "Home", "destinationAddress": "88 Synthetic Patient Road", "livesAlone": False, "stairsAtHome": "Elevator available", "caregiverName": "Margaret Reid", "caregiverPhone": "555-222-3333", "caregiverRelationship": "Daughter", "caregiverAvailableOnDischarge": True, "transportType": "Ambulance", "medicationReconciliationComplete": True, "newMedications": "", "insuranceVerified": True, "followUpType": "Pulmonology", "followUpDate": "2026-07-16", "followUpBooked": True, "equipmentNeeded": ["Wheelchair", "Oxygen"], "homeHealthOrdered": True, "communityServicesReferral": True, "physicianSignature": True, "socialWorkerSignature": True}
    }
]

results = {}
for s in scenarios:
    snap = test_scenario(s["id"], s["patientId"], s["formData"])
    # extract the relevant parts from the snapshot tree to see blocks/warnings
    tree = snap.get("tree", "")
    results[s["id"]] = tree

with open("c:/Cap-KxG/scratch/results_raw.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("Done running scenarios!")
