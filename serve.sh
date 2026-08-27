#!/usr/bin/env bash
# A simple script to serve the dist directory for testing

PORT="${1:-8000}"
echo "Serving 'dist' directory at http://localhost:$PORT"
python3 -m http.server "$PORT" -d dist
