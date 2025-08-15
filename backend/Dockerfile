FROM python:3.12-slim

WORKDIR /app

# copy requirements and install
COPY backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# copy backend 'app' package directly so that it is importable as 'app'
COPY backend/app /app/app
# copy other backend support directories if any (e.g., jobs are inside app)
COPY ml /app/ml

# Ensure backend root is in PYTHONPATH
ENV PYTHONPATH="/app:${PYTHONPATH}"

# default command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
