#!/bin/bash
# Script para publicar el backend en Vercel

echo "🚀 Publicando backend en Vercel..."

cd backend

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio backend."
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Hacer build
echo "🔨 Construyendo proyecto..."
npm run build

# Verificar que el build fue exitoso
if [ ! -d "dist" ]; then
    echo "❌ Error: El build falló. No se encontró el directorio dist."
    exit 1
fi

# Verificar que vercel.json existe
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: No se encontró vercel.json"
    exit 1
fi

# Publicar en Vercel
echo "🌐 Publicando en Vercel..."
if command -v vercel &> /dev/null; then
    vercel --prod
else
    echo "⚠️  Vercel CLI no está instalado. Instálalo con: npm install -g vercel"
    echo "📝 O publica manualmente desde https://vercel.com"
    exit 1
fi

echo "✅ Backend publicado exitosamente!"

