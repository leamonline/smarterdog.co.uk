#!/usr/bin/env bash
# Deploy the built site (dist/) to a cPanel public_html directory.
# Usage: ./scripts/cpanel-deploy.sh /path/to/public_html

set -euo pipefail

readonly DEPLOYPATH=${1:?'Provide the deployment path as the first argument'}
readonly ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
readonly BUILD_DIR="$ROOT_DIR/dist"

log_info() {
  printf '[cPanel] %s\n' "$1"
}

main() {
  if [[ ! -d "$BUILD_DIR" ]]; then
    log_info "Build directory not found at $BUILD_DIR"
    log_info "Run 'npm run build' before deploying."
    exit 1
  fi

  log_info "Deploying dist/ to $DEPLOYPATH"
  mkdir -p "$DEPLOYPATH"

  log_info "Clearing existing files"
  find "$DEPLOYPATH" -mindepth 1 -maxdepth 1 -exec rm -rf {} +

  log_info "Copying new build"
  cp -a "$BUILD_DIR"/. "$DEPLOYPATH"/

  log_info "Deployment complete"
}

main "$@"
