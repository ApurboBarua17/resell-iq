#!/usr/bin/env bash
# ./scripts/stop.sh [compose|minikube]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-compose}"

case "$MODE" in
  compose)
    docker compose -f "$ROOT/docker-compose.yml" down
    ;;
  minikube)
    kubectl delete namespace resell-iq --ignore-not-found
    echo "Namespace deleted. Run 'minikube stop' to stop the cluster entirely."
    ;;
  *)
    echo "Usage: $0 [compose|minikube]" >&2
    exit 1
    ;;
esac
