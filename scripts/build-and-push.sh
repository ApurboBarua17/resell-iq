#!/usr/bin/env bash
# Builds all three images inside Minikube's Docker daemon
# (imagePullPolicy: IfNotPresent — no registry push needed).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Pointing docker CLI at Minikube's daemon"
eval "$(minikube docker-env)"

echo "==> Building api-gateway"
docker build -t resell-iq/api-gateway:latest "$ROOT/services/api-gateway"

echo "==> Building pricing-worker"
docker build -t resell-iq/pricing-worker:latest "$ROOT/services/pricing-worker"

echo "==> Building frontend (nginx serve stage)"
docker build -t resell-iq/frontend:latest --target serve "$ROOT/services/frontend"

echo "==> Images built"
