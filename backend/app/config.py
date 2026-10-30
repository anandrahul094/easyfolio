import os

AMFI_URL = os.getenv("EASYFOLIO_AMFI_URL", "https://portal.amfiindia.com/spages/NAVAll.txt")
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "21600"))
REQUEST_TIMEOUT_SECONDS = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "30"))
REFRESH_TOKEN = os.getenv("EASYFOLIO_REFRESH_TOKEN", "")
CORS_ORIGINS = [x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if x.strip()]
