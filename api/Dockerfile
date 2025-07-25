FROM python:3.13-slim

WORKDIR /api

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

CMD ["uvicorn", "main:api", "--host", "0.0.0.0", "--port", "11435", "--reload"]