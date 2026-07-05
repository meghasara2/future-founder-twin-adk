import requests
import json
import uuid

url = "http://127.0.0.1:8000/run_sse"
payload = {
    "appName": "future_founder_twin",
    "agentName": "FutureFounderTwinPhase1",
    "userId": "user_" + str(uuid.uuid4()),
    "sessionId": "session_" + str(uuid.uuid4()),
    "newMessage": {
        "role": "user",
        "parts": [{"text": "I am a python dev building a SaaS for dog walkers."}]
    }
}

print("Sending request...")
response = requests.post(url, json=payload, stream=True)
print("Response status:", response.status_code)

for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))
