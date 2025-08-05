#!/bin/bash -e

cd /home/user/actions-runner

RESPONSE=$(curl -sSL -w "%{http_code}" \
  -o /tmp/registration_token.json \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}" \
  https://api.github.com/repos/${OWNER}/${REPO}/actions/runners/registration-token)

HTTP_CODE="${RESPONSE: -3}"

if [ "$HTTP_CODE" != 201 ]; then
  echo "Error: Failed to get registration token from GitHub API (HTTP $HTTP_CODE)"
  cat /tmp/registration_token.json
  exit 1
fi

REGISTRATION_TOKEN=$(jq -r .token < /tmp/registration_token.json)

if [ -z "$REGISTRATION_TOKEN" ] || [ "$REGISTRATION_TOKEN" == "null" ]; then
  echo "Error: Registration token is empty or invalid"
  cat /tmp/registration_token.json
  exit 1
fi

./config.sh \
  --url "https://github.com/${OWNER}/${REPO}" \
  --token "${REGISTRATION_TOKEN}" \
  --ephemeral \
  --unattended

./run.sh
