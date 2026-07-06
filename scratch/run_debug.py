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

session = "debug_fill"
call_daemon(session, "navigate", {"url": "http://localhost:5173", "newTab": True, "group_title": session})
time.sleep(2)

js_dump = """
(() => {
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    const vals = {};
    for (const i of inputs) {
        if (i.type === 'checkbox') vals[i.name] = i.checked;
        else if (i.multiple) {
            vals[i.name] = Array.from(i.options).filter(o => o.selected).map(o => o.value);
        } else {
            vals[i.name] = i.value;
        }
    }
    return JSON.stringify(vals);
})()
"""
res = call_daemon(session, "evaluate", {"code": js_dump})
print("Before:", res.get('data', {}).get('value'))

form_data = {"dischargeDate": "2026-07-09", "dischargeStatus": "Routine", "destination": "Home", "destinationAddress": "88 Synthetic Patient Road", "livesAlone": True, "stairsAtHome": "6+ steps", "caregiverName": "Margaret Reid", "caregiverPhone": "555-222-3333", "caregiverRelationship": "Daughter", "caregiverAvailableOnDischarge": True, "transportType": "Wheelchair Van", "medicationReconciliationComplete": True, "newMedications": "", "insuranceVerified": True, "followUpType": "Pulmonology", "followUpDate": "2026-07-16", "followUpBooked": True, "equipmentNeeded": ["Wheelchair", "Oxygen"], "homeHealthOrdered": True, "communityServicesReferral": True, "physicianSignature": True, "socialWorkerSignature": True}

js_fill = f"""
(() => {{
    const setNativeValue = (element, value) => {{
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
        
        if (valueSetter && valueSetter !== prototypeValueSetter) {{
            prototypeValueSetter.call(element, value);
        }} else {{
            valueSetter.call(element, value);
        }}
    }};
    
    const setNativeChecked = (element, value) => {{
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'checked').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'checked').set;
        
        if (valueSetter && valueSetter !== prototypeValueSetter) {{
            prototypeValueSetter.call(element, value);
        }} else {{
            valueSetter.call(element, value);
        }}
    }};

    const patientSelect = document.querySelector('select[name="patientId"]');
    if (patientSelect) {{
        setNativeValue(patientSelect, "MRN-300");
        patientSelect.dispatchEvent(new Event("change", {{ bubbles: true }}));
    }}
    
    const formData = {json.dumps(form_data)};
    for (const [key, value] of Object.entries(formData)) {{
        const el = document.querySelector(`[name="${{key}}"]`);
        if (el) {{
            if (el.type === 'checkbox') {{
                setNativeChecked(el, value);
                el.dispatchEvent(new Event('change', {{ bubbles: true }}));
            }} else if (el.tagName === 'SELECT') {{
                if (el.multiple && Array.isArray(value)) {{
                    Array.from(el.options).forEach(opt => {{
                        opt.selected = value.includes(opt.value);
                    }});
                    el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }} else {{
                    setNativeValue(el, value);
                    el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }}
            }} else {{
                setNativeValue(el, value);
                el.dispatchEvent(new Event('input', {{ bubbles: true }}));
                el.dispatchEvent(new Event('change', {{ bubbles: true }}));
            }}
        }}
    }}
    
    return true;
}})()
"""
call_daemon(session, "evaluate", {"code": js_fill})
time.sleep(1)

res = call_daemon(session, "evaluate", {"code": js_dump})
print("After:", res.get('data', {}).get('value'))
