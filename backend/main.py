import os
import uvicorn
from google.adk.cli.fast_api import get_fast_api_app
from google.adk.sessions import InMemorySessionService
from google.adk.memory import InMemoryMemoryService

# Load environment
from dotenv import load_dotenv
load_dotenv()

# Verify API keys
api_keys = [k for k in [os.getenv(f"GOOGLE_API_KEY{suffix}") for suffix in ["", "_2", "_3"]] if k]
if not api_keys:
    print("WARNING: No GOOGLE_API_KEY set. Agents will fail immediately.")
else:
    print(f"INFO: Loaded {len(api_keys)} API key(s) for rate limit rotation.")

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
]
if os.getenv("FRONTEND_URL"):
    origins.append(os.getenv("FRONTEND_URL"))

# The CLI wrapper will handle the session/memory services via use_local_storage=False
app = get_fast_api_app(
    agents_dir=".",
    web=False,
    use_local_storage=False,
    allow_origins=origins,
)

# Add CORS explicitly for frontend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint (useful for demo and Cloud Run)
@app.get("/health")
async def health():
    return {"status": "ok", "agent": "FutureFounderTwin", "version": "1.0.0"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
