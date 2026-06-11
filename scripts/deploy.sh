#!/usr/bin/env bash
# Applies all manifests and creates the resell-secrets Secret from .env
# (never committed — created at deploy time).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "$ROOT/.env" ]]; then
  echo "ERROR: $ROOT/.env not found. Copy .env.example to .env and fill in secrets." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source "$ROOT/.env"
set +a

kubectl apply -f "$ROOT/kubernetes/namespace.yaml"
kubectl apply -f "$ROOT/kubernetes/configmap.yaml"

echo "==> Creating/updating resell-secrets"
kubectl create secret generic resell-secrets \
  --namespace resell-iq \
  --from-literal=GITHUB_TOKEN="${GITHUB_TOKEN:?GITHUB_TOKEN missing in .env}" \
  --from-literal=EBAY_CLIENT_ID="${EBAY_CLIENT_ID:?EBAY_CLIENT_ID missing in .env}" \
  --from-literal=EBAY_CLIENT_SECRET="${EBAY_CLIENT_SECRET:?EBAY_CLIENT_SECRET missing in .env}" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -R -f "$ROOT/kubernetes/redis"
kubectl apply -R -f "$ROOT/kubernetes/postgres"
kubectl apply -R -f "$ROOT/kubernetes/api-gateway"
kubectl apply -R -f "$ROOT/kubernetes/pricing-worker"
kubectl apply -R -f "$ROOT/kubernetes/frontend"

echo "==> Waiting for pods"
kubectl get pods -n resell-iq
