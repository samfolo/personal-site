#!/bin/bash
# Fetch recent Cloud Run logs
# Usage: ./scripts/logs.sh [line_count]
# Default: 50 lines

set -e

REGION="europe-west2"
SERVICE_NAME="personal-site"
LIMIT="${1:-50}"

gcloud run services logs read "$SERVICE_NAME" \
  --region="$REGION" \
  --limit="$LIMIT"
