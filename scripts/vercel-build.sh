#!/bin/bash
# Build script for Vercel

echo "Installing backend dependencies..."
npm install --prefix backend

echo "Building backend..."
npm run --prefix backend build

echo "Installing frontend dependencies..."
npm install --prefix frontend

echo "Building frontend..."
npm run --prefix frontend build

echo "Copying files..."
node scripts/copiar-api.js

echo "Done!"