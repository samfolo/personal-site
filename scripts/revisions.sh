#!/bin/bash
# List deployed Cloud Run revisions with traffic allocation
# Usage: ./scripts/revisions.sh

set -e

REGION="europe-west2"
SERVICE_NAME="personal-site"

gcloud run revisions list \
  --service="$SERVICE_NAME" \
  --region="$REGION" \
  --format="table(REVISION,ACTIVE,LAST_DEPLOYED_BY,DEPLOYED)"

echo ""
echo "Traffic allocation:"
gcloud run services describe "$SERVICE_NAME" \
  --region="$REGION" \
  --format="yaml(status.traffic)"
