#!/bin/bash -e

LATEST_VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest \
  | jq -r .tag_name \
  | sed 's/^v//'
)

DOCKERFILE_DIR=$(dirname "$0")

docker build \
  --platform linux/x86_64 \
  --build-arg RUNNER_VERSION=${LATEST_VERSION} \
  -t actions-runner:latest \
  -f "${DOCKERFILE_DIR}/Dockerfile" \
  "${DOCKERFILE_DIR}"
