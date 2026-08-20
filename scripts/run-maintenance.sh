#!/usr/bin/env bash
set -euo pipefail

echo "[maintenance] Installing locked dependencies"
pnpm install --frozen-lockfile

echo "[maintenance] Type checking"
pnpm check

echo "[maintenance] Linting"
pnpm lint

echo "[maintenance] Running tests"
pnpm test

echo "[maintenance] Building server"
pnpm build

echo "[maintenance] Exporting Android bundle"
npx expo export --platform android

echo "[maintenance] Verifying Expo dependency health"
npx expo-doctor

echo "[maintenance] Completed successfully"
