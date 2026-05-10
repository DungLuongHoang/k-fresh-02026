#!/usr/bin/env bash
#
# scripts/bootstrap-milestones.sh
#
# Idempotently creates the milestones defined in .github/MILESTONES.md.
# Safe to run multiple times — existing titles are skipped.
#
# Auth resolution order:
#   1. $GITHUB_TOKEN  (repo scope)
#   2. $GH_TOKEN
#   3. `gh auth token`
#
# Repo resolution order:
#   1. $GITHUB_REPOSITORY  (e.g. owner/repo)
#   2. `gh repo view --json nameWithOwner -q .nameWithOwner`
#   3. `git config --get remote.origin.url` (parsed)
#
# Usage:
#   npm run bootstrap:milestones
#   GITHUB_REPOSITORY=your-org/your-fork ./scripts/bootstrap-milestones.sh

set -euo pipefail

# ── helpers ────────────────────────────────────────────────────────────────────

bold()   { printf '\033[1m%s\033[0m\n'        "$*"; }
green()  { printf '\033[32m✓\033[0m %s\n'     "$*"; }
yellow() { printf '\033[33m▸\033[0m %s\n'     "$*"; }
red()    { printf '\033[31m✗\033[0m %s\n' "$*" >&2; }

require() {
  command -v "$1" >/dev/null 2>&1 || { red "$1 is required but not installed"; exit 1; }
}

require curl
require jq

# ── token ──────────────────────────────────────────────────────────────────────

TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
if [[ -z "$TOKEN" ]] && command -v gh >/dev/null 2>&1; then
  TOKEN="$(gh auth token 2>/dev/null || true)"
fi
if [[ -z "$TOKEN" ]]; then
  red "No token found. Set GITHUB_TOKEN, GH_TOKEN, or run 'gh auth login'."
  exit 1
fi

# ── repo ───────────────────────────────────────────────────────────────────────

REPO="${GITHUB_REPOSITORY:-}"
if [[ -z "$REPO" ]] && command -v gh >/dev/null 2>&1; then
  REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
fi
if [[ -z "$REPO" ]]; then
  origin="$(git config --get remote.origin.url 2>/dev/null || true)"
  case "$origin" in
    *github.com[:/]*)
      REPO="$(printf '%s' "$origin" | sed -E 's#.*github\.com[:/](.*)\.git$#\1#; s#.*github\.com[:/](.+)$#\1#')"
      ;;
  esac
fi
if [[ -z "$REPO" ]]; then
  red "Could not determine repo. Set GITHUB_REPOSITORY=owner/repo."
  exit 1
fi

bold "Bootstrapping milestones in $REPO"

API="https://api.github.com/repos/$REPO/milestones"
HDRS=(-H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json")

# ── catalogue ──────────────────────────────────────────────────────────────────
# Format per row:  STATE | TITLE | DUE_ON_OR_EMPTY | DESCRIPTION
#
# Keep this list in sync with .github/MILESTONES.md.

MILESTONES=(
  "closed|v1.0 · Foundations||POM framework (locators/ → pages/ → tests/), basic UI/API specs against the OpenCart demo, Allure 3, multi-channel run notifications."
  "closed|v1.1 · Multi-env CI & Live Dashboard||qa/uat/staging matrix in GitHub Actions, GitHub Pages auto-deploy, environment switcher, Run-Context card, dashboard PDF + live HTML."
  "closed|v1.2 · AI Prompt + Skill Library||prompts/core, advanced, devops, reporting; prompt orchestrator; 30+ Agent Skills under .agents/skills/; defect-labels and test-tags conventions."
  "closed|v1.3 · Training Curriculum||33-module, 6-phase QA Engineer training under training/ (Foundations → AI-Assisted QA), every module backed by code in this repo."
  "open|v2.0 · Coverage Hardening|2026-08-31T23:59:59Z|Close all open REQ-* traceability gaps, expand tests/api/test-security.spec.ts, add visual-regression baselines + axe-core a11y scans, raise pass-rate target to ≥ 98%."
  "open|v2.1 · Mobile & Cross-browser|2026-11-30T23:59:59Z|Mobile-emulation Playwright projects (iPhone 14, Pixel 8), real-device support via BrowserStack/SauceLabs, responsive-layout regression suite."
  "open|v2.2 · Self-Healing & AI-Assisted Authoring|2027-02-28T23:59:59Z|AI-driven locator healing in CI on selector-resolution failures, automated flaky-test triage opening pre-filled GitHub issues, AI auto-PR generation from failed runs."
  "open|Backlog||Catch-all for unscheduled ideas, nice-to-haves, and discovered work waiting for prioritisation. Never closes."
)

# ── existing milestones (any state) ────────────────────────────────────────────

existing_json="$(curl -fsS "${HDRS[@]}" "$API?state=all&per_page=100")"

title_to_number() {
  printf '%s' "$existing_json" | jq -r --arg t "$1" '.[] | select(.title == $t) | .number'
}

created=0
skipped=0
patched=0
errors=0

for entry in "${MILESTONES[@]}"; do
  IFS='|' read -r state title due description <<<"$entry"

  number="$(title_to_number "$title")"

  if [[ -n "$number" ]]; then
    yellow "exists: $title (#$number) — leaving as-is"
    skipped=$((skipped + 1))
    continue
  fi

  payload="$(jq -n \
    --arg title "$title" \
    --arg description "$description" \
    --arg state "$state" \
    --arg due "$due" \
    '{title: $title, description: $description, state: $state} +
     (if $due == "" then {} else {due_on: $due} end)')"

  if response="$(curl -fsS -X POST "${HDRS[@]}" -H "Content-Type: application/json" -d "$payload" "$API" 2>&1)"; then
    n="$(printf '%s' "$response" | jq -r '.number')"
    green "created: $title (#$n, state=$state)"
    created=$((created + 1))
  else
    red   "failed:  $title — $response"
    errors=$((errors + 1))
  fi
done

echo
bold "Summary"
echo "  created: $created"
echo "  skipped: $skipped (already existed)"
echo "  patched: $patched"
echo "  errors:  $errors"

if (( errors > 0 )); then
  exit 1
fi
