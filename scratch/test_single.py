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

session = "test_fill_single"
call_daemon(session, "navigate", {"url": "http://localhost:5173", "newTab": True, "group_title": session})
time.sleep(2)

js = """
(() => {
    const el = document.getElementById("destinationAddress");
    const setNativeValue = (element, val) => {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
        if (valueSetter && valueSetter !== prototypeValueSetter) prototypeValueSetter.call(element, val);
        else valueSetter.call(element, val);
    };
    setNativeValue(el, "88 Test Road");
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return el.value;
})()
"""
res = call_daemon(session, "evaluate", {"code": js})
print("Address set to:", res)

# Then click review
js_click = """
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
call_daemon(session, "evaluate", {"code": js_click})
time.sleep(1)

# Check errors
js_extract = """
(() => {
    const region = document.querySelector('[aria-label="Discharge safety alerts"]');
    if (region) return region.innerText || region.textContent;
    return "None";
})()
"""
print("Alerts:", call_daemon(session, "evaluate", {"code": js_extract}))

