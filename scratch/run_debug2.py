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

session = "debug_html2"
call_daemon(session, "navigate", {"url": "http://localhost:5173", "newTab": True, "group_title": session})
time.sleep(2)

js = """
(() => {
    return Array.from(document.querySelectorAll('input, select, textarea')).map(i => ({tag: i.tagName, type: i.type, name: i.name, id: i.id, className: i.className}));
})()
"""
res2 = call_daemon(session, "evaluate", {"code": js})
print(json.dumps(res2.get('data', {}).get('value'), indent=2))
