#!/bin/bash
# List and optionally remove preview traffic tags
# Usage: ./scripts/cleanup-previews.sh
# Prompts for confirmation before deleting any tags

set -e

REGION="europe-west2"
SERVICE_NAME="personal-site"

echo "Fetching preview tags for $SERVICE_NAME..."
echo ""

# Get all traffic tags (preview deployments have tags, production does not)
TAGS=$(gcloud run services describe "$SERVICE_NAME" \
  --region="$REGION" \
  --format="value(status.traffic.tag)" | tr ';' '\n' | grep -v '^$' || true)

if [ -z "$TAGS" ]; then
  echo "No preview tags found."
  exit 0
fi

echo "Preview tags found:"
echo "$TAGS" | while read -r tag; do
  echo "  - $tag"
done
echo ""

read -p "Do you want to remove these preview tags? (y/N): " -r REPLY
echo ""

if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then
  echo "Cancelled. No tags removed."
  exit 0
fi

echo "Removing preview tags..."
echo "$TAGS" | while read -r tag; do
  if [ -n "$tag" ]; then
    echo "  Removing tag: $tag"
    gcloud run services update-traffic "$SERVICE_NAME" \
      --region="$REGION" \
      --remove-tags="$tag" \
      --quiet
  fi
done

echo ""
echo "Preview tags removed successfully."
