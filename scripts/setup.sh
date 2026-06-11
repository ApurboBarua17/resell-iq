#!/usr/bin/env bash
# Installs minikube + kubectl if missing (macOS, via Homebrew).
set -euo pipefail

if ! command -v brew >/dev/null 2>&1; then
  echo "ERROR: Homebrew required — https://brew.sh" >&2
  exit 1
fi

for tool in minikube kubectl; do
  if command -v "$tool" >/dev/null 2>&1; then
    echo "==> $tool already installed: $($tool version --client --short 2>/dev/null || $tool version | head -1)"
  else
    echo "==> Installing $tool"
    brew install "$tool"
  fi
done

echo "==> Setup complete"
