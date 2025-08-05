#!/bin/bash -e

RESPONSE_BODY=$(mktemp)
RESPONSE=$(curl -sSL -w "%{http_code}" \
  -o "${RESPONSE_BODY}" \
  "https://api.github.com/repos/actions/runner/releases/latest")

HTTP_CODE="${RESPONSE: -3}"

if [ "$HTTP_CODE" != 200 ]; then
  echo "Error: Failed to get latest runner version from GitHub API (HTTP $HTTP_CODE)"
  rm -f "$RESPONSE_BODY"
  exit 1
fi

RESPONSE=$(<"$RESPONSE_BODY")
rm -f "$RESPONSE_BODY"

LATEST_VERSION=$(echo "$RESPONSE" \
  | jq -r '.tag_name' \
  | sed 's/^v//')

if [ -z "$LATEST_VERSION" ] || ! [[ "$LATEST_VERSION" =~ ^[0-9]+(\.[0-9]+)*$ ]]; then
  echo "Error: Latest version is empty or invalid"
  exit 1
fi

echo "Latest GitHub Actions Runner version: v$LATEST_VERSION"

DOCKERFILE_DIR=$(dirname "$0")

docker build \
  --platform linux/x86_64 \
  --build-arg RUNNER_VERSION="${LATEST_VERSION}" \
  -t actions-runner:latest \
  -f "${DOCKERFILE_DIR}/Dockerfile" \
  "${DOCKERFILE_DIR}"
