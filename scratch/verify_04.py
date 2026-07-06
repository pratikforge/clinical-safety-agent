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

session = "tricky_04_elevator_saves_the_day"
res = call_daemon(session, "snapshot", {})
tree = res.get("data", {}).get("tree", {})
with open("c:/Cap-KxG/scratch/tricky_04_snap.json", "w", encoding="utf-8") as f:
    json.dump(tree, f, indent=2)

js = """
(() => {
    return {
        stairs: document.getElementById('stairsAtHome').value,
        transport: document.getElementById('transportType').value
    }
})()
"""
val = call_daemon(session, "evaluate", {"code": js})
print(val)
