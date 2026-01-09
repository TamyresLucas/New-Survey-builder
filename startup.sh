#!/bin/bash
set -e

echo "Installing production dependencies..."
npm ci --production --prefer-offline

echo "Starting application..."
npm start

