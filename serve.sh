#!/usr/bin/env bash
# A simple script to serve the site directory for testing

PORT="${1:-8000}"
echo "Serving 'site' directory at http://localhost:$PORT"
python3 -m http.server "$PORT" -d site
