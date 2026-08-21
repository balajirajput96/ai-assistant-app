#!/usr/bin/env bash
set -euo pipefail

report_gws_health() {
  local status="$1"
  echo "[maintenance] Google Workspace CLI health: ${status}"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "google_workspace_health=${status}" >> "${GITHUB_OUTPUT}"
  fi
}

if [[ "${ATLAS_GWS_HEALTH_CHECK:-false}" == "true" ]]; then
  if ! command -v gws >/dev/null 2>&1; then
    report_gws_health "cli-not-installed"
  elif gws drive about get --params '{"fields":"storageQuota"}' >/dev/null 2>&1; then
    report_gws_health "authorized-read-only-check-passed"
  else
    report_gws_health "authorization-required-or-check-failed"
  fi
else
  report_gws_health "not-requested"
fi

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
