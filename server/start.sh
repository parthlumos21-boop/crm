#!/bin/bash

# Navigate to the directory where the script is located
cd "$(dirname "$0")"

echo "Installing production dependencies..."
npm ci --only=production || npm install --omit=dev

echo "Starting CRM Server in production mode using PM2..."
npm run start:prod

echo "Server deployed successfully. You can monitor it using 'pm2 logs crm-server'."
