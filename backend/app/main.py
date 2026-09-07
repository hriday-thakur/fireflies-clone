"""
FastAPI application entrypoint. Run with:
    uvicorn app.main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import meetings, action_items, search

# Creates all tables defined in models.py if they don't already exist.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fireflies Clone API")

# Allows the Next.js frontend (running on a different port) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router)
app.include_router(action_items.router)
app.include_router(search.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "Fireflies Clone API"}
