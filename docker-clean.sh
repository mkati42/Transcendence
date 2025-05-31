#!/bin/bash

echo "Docker temizleme işlemi başlıyor..."

# Çalışan tüm konteynerleri durdur
echo "Tüm çalışan konteynerler durduruluyor..."
docker ps -q | xargs -r docker stop

# Tüm konteynerleri sil
echo "Tüm konteynerler siliniyor..."
docker ps -aq | xargs -r docker rm

# Tüm hacimleri sil
echo "Tüm hacimler siliniyor..."
docker volume prune -f

# Tüm ağları sil
echo "Tüm ağlar siliniyor..."
docker network prune -f

# Tüm kullanılmayan imajları sil (isteğe bağlı)
echo "Kullanılmayan Docker imajları siliniyor..."
docker image prune -af

echo "Docker temizleme işlemi tamamlandı!"