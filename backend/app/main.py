from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router
from app.config import CORS_ORIGINS

app = FastAPI(title="EasyFolio API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["Content-Type", "X-Refresh-Token"])
app.include_router(router)
