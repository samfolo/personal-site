#!/bin/bash
# Print the production Cloud Run service URL
# Usage: ./scripts/url.sh

set -e

REGION="europe-west2"
SERVICE_NAME="personal-site"

gcloud run services describe "$SERVICE_NAME" \
  --region="$REGION" \
  --format="value(status.url)"
