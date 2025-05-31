#!/bin/bash

set -e  # Hata durumunda script'i durdur

echo "Waiting for PostgreSQL to start..."

# PostgreSQL hazır olana kadar bekle (pg_isready daha güvenilir)
until pg_isready -h postgres -p 5432 -U $POSTGRES_USER; do
  echo "PostgreSQL is not ready yet, retrying in 5 seconds..."
  sleep 5
done

echo "PostgreSQL is up - continuing..."

# Static dosyaları topla
# echo "Collecting static files..."
# python manage.py collectstatic --noinput

# # Django migrasyonlarını çalıştır
# echo "Running database migrations..."
# python manage.py makemigrations
# python manage.py migrate

# Kullanıcı modeli migrasyonu (Varsa)
# echo "Running user migrations (if exists)..."
# python manage.py makemigrations users || echo "Users app not found, skipping..."

# Django sunucusunu başlat
echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000
