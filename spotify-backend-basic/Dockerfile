FROM python:3.11-slim

RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Chỉ copy requirements trước để tận dụng cache
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Sau đó copy toàn bộ code
COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p 8000 djangoMNM.asgi:application"]

