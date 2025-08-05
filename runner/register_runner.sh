#!/bin/bash -e

cd /home/user/actions-runner

REGISTRATION_TOKEN=$(curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}" \
  https://api.github.com/repos/${OWNER}/${REPO}/actions/runners/registration-token \
  | jq -r .token)

./config.sh \
  --url https://github.com/${OWNER}/${REPO} \
  --token ${REGISTRATION_TOKEN} \
  --ephemeral \
  --unattended

./run.sh
