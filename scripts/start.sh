#!/usr/bin/env bash
# Idempotent one-shot launcher: ./scripts/start.sh [compose|minikube]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-compose}"

if [[ ! -f "$ROOT/.env" ]]; then
  echo "ERROR: $ROOT/.env not found. Copy .env.example to .env and fill in secrets." >&2
  exit 1
fi

case "$MODE" in
  compose)
    echo "==> Starting ResellIQ via docker compose"
    docker compose -f "$ROOT/docker-compose.yml" up --build -d
    echo "==> Frontend: http://localhost:5173"
    echo "==> API:      http://localhost:8000/api/health"
    ;;
  minikube)
    echo "==> Starting ResellIQ on Minikube"
    minikube status >/dev/null 2>&1 || minikube start
    "$ROOT/scripts/build-and-push.sh"
    "$ROOT/scripts/deploy.sh"
    echo "==> Frontend: $(minikube service frontend-service -n resell-iq --url)"
    ;;
  *)
    echo "Usage: $0 [compose|minikube]" >&2
    exit 1
    ;;
esac
