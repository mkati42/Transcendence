FROM python:3.9-slim

EXPOSE 8000

WORKDIR /game

RUN apt-get update && apt-get install -y libpq-dev gcc
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /game/

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5173
