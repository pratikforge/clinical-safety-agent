import json
import subprocess
import os
import time

def call_daemon(session, action, args):
    req_body = {
        "session": session,
        "action": action,
        "args": args
    }
    temp_file = os.path.join(os.environ.get("TEMP", "c:/temp"), f"wb-req-{time.time()}.json")
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(req_body, f)
        
    cmd = [
        "curl.exe", "-s", "-X", "POST", "http://127.0.0.1:10086/command",
        "-H", "Content-Type: application/json",
        "--data-binary", f"@{temp_file}"
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    os.remove(temp_file)
    if result.stdout:
        return json.loads(result.stdout)
    return None

def fill_form(session, patient_id, form_data):
    # Set patientId using select
    js_code = f"""
    (() => {{
        const setNativeValue = (element, value) => {{
            const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
            const prototype = Object.getPrototypeOf(element);
            const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
            if (valueSetter && valueSetter !== prototypeValueSetter) prototypeValueSetter.call(element, value);
            else valueSetter.call(element, value);
        }};
        const patientSelect = document.getElementById("patientId");
        if (patientSelect) {{
            setNativeValue(patientSelect, "{patient_id}");
            patientSelect.dispatchEvent(new Event("change", {{ bubbles: true }}));
        }}
        return true;
    }})()
    """
    call_daemon(session, "evaluate", {"code": js_code})
    time.sleep(1)
    
    # Use WebBridge fill
    for key, value in form_data.items():
        if isinstance(value, bool):
            # Checkbox - evaluate js directly for checkbox since fill might just enter text
            js_chk = f"""
            (() => {{
                const el = document.getElementById("{key}");
                if (el && el.checked !== {str(value).lower()}) {{
                    el.click(); // the most reliable way to toggle a checkbox in react
                }}
            }})()
            """
            call_daemon(session, "evaluate", {"code": js_chk})
            
        elif isinstance(value, list):
            # Multi-select
            js_sel = f"""
            (() => {{
                const el = document.getElementById("{key}");
                if (el && el.multiple) {{
                    const vals = {json.dumps(value)};
                    Array.from(el.options).forEach(opt => {{
                        opt.selected = vals.includes(opt.value);
                    }});
                    el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }}
            }})()
            """
            call_daemon(session, "evaluate", {"code": js_sel})
            
        else:
            # Text / Select
            # Some selects might be tricky, try JS first, but fill for text
            # Actually, `fill` handles select and input text automatically! Let's try fill!
            res = call_daemon(session, "fill", {"selector": f"#{key}", "value": str(value)})
            if not res or not res.get("data", {}).get("success"):
                # fallback to JS
                js_txt = f"""
                (() => {{
                    const el = document.getElementById("{key}");
                    if (el) {{
                        const setNativeValue = (element, val) => {{
                            const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
                            const prototype = Object.getPrototypeOf(element);
                            const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
                            if (valueSetter && valueSetter !== prototypeValueSetter) prototypeValueSetter.call(element, val);
                            else valueSetter.call(element, val);
                        }};
                        setNativeValue(el, "{value}");
                        el.dispatchEvent(new Event('input', {{ bubbles: true }}));
                        el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                    }}
                }})()
                """
                call_daemon(session, "evaluate", {"code": js_txt})

def test_scenario(scenario_id, patient_id, form_data):
    print(f"--- Starting {scenario_id} ---")
    session = scenario_id
    
    call_daemon(session, "navigate", {"url": "http://localhost:5173", "newTab": True, "group_title": scenario_id})
    time.sleep(2)
    
    fill_form(session, patient_id, form_data)
    time.sleep(1)
    
    # Click Review Discharge
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
    time.sleep(2)
    
    js_extract = """
    (() => {
        const alerts = document.querySelectorAll('[role="alert"], .text-red-800, .text-yellow-800, .bg-red-50, .bg-yellow-50, [class*="alert"]');
        if (alerts.length > 0) return Array.from(alerts).map(a => a.innerText || a.textContent).join('\\n');
        
        const summary = document.querySelector('[aria-label="Alert summary"]');
        if (summary) return summary.innerText || summary.textContent;
        
        const blocks = document.querySelector('[aria-label="Discharge safety alerts"]');
        if (blocks) return blocks.innerText || blocks.textContent;
        
        return "Not found";
    })()
    """
    res = call_daemon(session, "evaluate", {"code": js_extract})
    return res

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
    res = test_scenario(s["id"], s["patientId"], s["formData"])
    
    text_content = res.get("data", {}).get("value", "") if res and res.get("data") else ""
    results[s["id"]] = text_content

with open("c:/Cap-KxG/scratch/results_2.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("Done running scenarios!")
