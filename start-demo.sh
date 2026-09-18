#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if [ ! -f .env ]; then cp .env.example .env; fi
npm ci --no-fund --no-audit
npm run build
printf '\nOpen http://localhost:4173 after the server starts. Keep this terminal open.\n'
npm start
