from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings


app = FastAPI(
    title="Tokyo Tree Doctor API",
    description="ドローンとAIで東京の樹木を診断するプロジェクトのAPI",
    version="1.0.0",
)

# CORS (開発時)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"message": "Welcome to Tokyo Tree Doctor API"}

