from __future__ import annotations

import json
from pathlib import Path

from google.adk.agents.run_config import RunConfig, StreamingMode
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from discharge_agent.agent import root_agent


ROOT = Path(__file__).resolve().parents[2]
DATASET = ROOT / "tests" / "eval" / "datasets" / "basic-dataset.json"
OUT = ROOT / "artifacts" / "traces" / "local_traces.json"


def run_prompt(prompt: str, case_id: str) -> str:
    session_service = InMemorySessionService()
    session = session_service.create_session_sync(
        user_id=f"eval_{case_id}",
        app_name="local_eval",
    )
    runner = Runner(agent=root_agent, session_service=session_service, app_name="local_eval")
    message = types.Content(role="user", parts=[types.Part.from_text(text=prompt)])
    events = list(
        runner.run(
            new_message=message,
            user_id=f"eval_{case_id}",
            session_id=session.id,
            run_config=RunConfig(streaming_mode=StreamingMode.SSE),
        )
    )
    return "\n".join(
        part.text
        for event in events
        if event.content and event.content.parts
        for part in event.content.parts
        if part.text
    )


def main() -> None:
    dataset = json.loads(DATASET.read_text(encoding="utf-8"))
    traced_cases = []
    for case in dataset["eval_cases"]:
        prompt_text = "\n".join(part["text"] for part in case["prompt"]["parts"])
        response_text = run_prompt(prompt_text, case["eval_case_id"])
        traced_cases.append(
            {
                **case,
                "responses": [
                    {
                        "response": {
                            "role": "model",
                            "parts": [{"text": response_text}],
                        }
                    }
                ],
            }
        )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"eval_cases": traced_cases}, indent=2), encoding="utf-8")
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
