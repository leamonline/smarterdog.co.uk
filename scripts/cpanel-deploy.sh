#!/usr/bin/env bash
# Deploys the static site to cPanel, skipping any files that are missing.
# Usage: ./scripts/cpanel-deploy.sh /path/to/deploy

set -euo pipefail

readonly DEPLOYPATH=${1:?"Provide the deployment path as the first argument"}
readonly ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

log_info() {
  printf '[cPanel] %s\n' "$1"
}

log_skip() {
  local kind=$1
  local name=$2
  printf '[cPanel] Skipping missing %s: %s\n' "$kind" "$name"
}

copy_file() {
  local file=$1
  local source="$ROOT_DIR/$file"
  local destination="$DEPLOYPATH/$file"

  if [[ -f "$source" ]]; then
    mkdir -p "$(dirname "$destination")"
    # "cp" preserves file contents (including binary assets) without changing permissions.
    cp -p "$source" "$destination"
  else
    log_skip "file" "$file"
  fi
}

copy_directory() {
  local dir=$1
  local source="$ROOT_DIR/$dir"
  local destination="$DEPLOYPATH/$dir"

  if [[ -d "$source" ]]; then
    rm -rf "$destination"
    mkdir -p "$destination"
    # Copy the whole directory tree while preserving attributes so binaries stay intact.
    cp -a "$source"/. "$destination"/
  else
    log_skip "directory" "$dir"
  fi
}

prepare_paths() {
  mkdir -p "$DEPLOYPATH"
}

main() {
  prepare_paths
  log_info "Deploying repository snapshot to $DEPLOYPATH"

  # Copy static pages and configuration files.
  local -a pages=(
    "index.html"
    "404.html"
    "cookies.html"
    "faqs.html"
    "offline.html"
    "privacy.html"
    "terms.html"
  )

  local -a configs=(
    ".htaccess"
    "robots.txt"
    "sitemap.xml"
    "security.txt"
    "manifest.json"
    "service-worker.js"
  )

  local -a images=(
    "logo.png"
    "logo-desktop.webp"
    "logo-mobile.webp"
    "logo-tablet.webp"
    "mollie.jpg"
    "vinny.jpg"
    "vinnyhero.jpg"
    "ourworkone.jpg"
    "ourworktwo.jpg"
    "ourworkthree.jpg"
    "ourworkfour.jpg"
  )

  for file in "${pages[@]}"; do
    copy_file "$file"
  done

  for file in "${configs[@]}"; do
    copy_file "$file"
  done

  for file in "${images[@]}"; do
    copy_file "$file"
  done

  # Copy the built assets when they exist.
  copy_directory "dist/css"
  copy_directory "dist/js"

  log_info "Deployment files copied"
}

main "$@"
