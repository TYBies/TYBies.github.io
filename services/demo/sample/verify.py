"""Run only a new, uniquely named Compose project; always remove its containers."""
import datetime
import json
import os
import subprocess
import urllib.request
import uuid

project = "release-pilot-" + uuid.uuid4().hex[:12]
base = ["docker", "compose", "-p", project]
events = []

def run(args, version="v1", expected=0):
    env = dict(os.environ, APP_VERSION=version)
    result = subprocess.run(base + args, env=env, text=True, capture_output=True)
    print(result.stdout, end="")
    print(result.stderr, end="")
    if (result.returncode == 0) != (expected == 0):
        raise RuntimeError("Unexpected exit: " + str(result.returncode))
    events.append({"command": "APP_VERSION=" + version + " docker compose -p <unique-project> " + " ".join(args), "exit_code": result.returncode})
    return result.stdout.strip()

def release(version):
    run(["up", "-d", "--wait", "--wait-timeout", "45"], version)
    address = run(["port", "app", "8080"], version)
    with urllib.request.urlopen("http://" + address + "/health", timeout=5) as response:
        body = json.load(response)
    assert body == {"version": version, "status": "ok"}, body
    events.append({"http_health": body})
    print("HTTP health verified:", body)

try:
    run(["build"])
    run(["run", "--rm", "--no-deps", "app", "python", "-m", "unittest", "-v"])
    release("v1")
    run(["run", "--rm", "--no-deps", "app", "python", "-m", "unittest", "-v"], "broken", 1)
    # Failed candidate never replaces the running v1.
    address = run(["port", "app", "8080"])
    with urllib.request.urlopen("http://" + address + "/health", timeout=5) as response:
        assert json.load(response) == {"version": "v1", "status": "ok"}
    events.append({"failed_candidate_blocked": True})
    run(["run", "--rm", "--no-deps", "app", "python", "-m", "unittest", "-v"], "v2")
    release("v2")
    release("v1")
    events.append({"rollback_verified": True})
finally:
    run(["down", "--remove-orphans", "--rmi", "local"])

print(json.dumps({"executed_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(), "environment": "Local Docker Compose; no cloud or GitHub Actions execution", "events": events}, indent=2))
