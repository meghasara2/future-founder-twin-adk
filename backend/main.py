import os
import uvicorn
from google.adk.cli.fast_api import get_fast_api_app
from google.adk.sessions import InMemorySessionService
from google.adk.memory import InMemoryMemoryService

# Load environment
from dotenv import load_dotenv
load_dotenv()

# Verify API key is set
if not os.getenv("GOOGLE_API_KEY"):
    print("WARNING: GOOGLE_API_KEY not set. Agents will fail.")

# The CLI wrapper will handle the session/memory services via use_local_storage=True
app = get_fast_api_app(
    agents_dir=".",
    web=False,
    use_local_storage=True,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Future Founder Twin ADK"}

# Add CORS explicitly for frontend
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint (useful for demo and Cloud Run)
@app.get("/health")
async def health():
    return {"status": "ok", "agent": "FutureFounderTwin", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
