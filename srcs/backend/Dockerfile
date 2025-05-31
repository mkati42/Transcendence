FROM python:3.9-slim

WORKDIR /backend

# PostgreSQL istemcisi ve gerekli bağımlılıkları yükle
RUN apt update && apt install -y postgresql-client
RUN apt-get update && apt-get install -y libpq-dev gcc
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Gerekli Python paketlerini yükle
COPY requirements.txt /backend/
RUN pip install --no-cache-dir -r requirements.txt

# EntryPoint dosyasını kopyala
COPY entrypoint.sh /backend/entrypoint.sh
RUN chmod +x /backend/entrypoint.sh

# Uygulama dosyalarını kopyala
COPY . .

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
