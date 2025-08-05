FROM debian:stable-slim

RUN apt-get update \
  && apt-get install -y \
  sudo \
  curl \
  jq \
  && rm -rf /var/lib/apt/lists/*

RUN useradd -m user \
  && echo "user ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
USER user

ARG RUNNER_VERSION
RUN <<EOF
  cd /home/user
  mkdir actions-runner && cd actions-runner
  curl -o ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
  tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
  rm ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
  sudo ./bin/installdependencies.sh
EOF

COPY ./register_runner.sh /home/user/register_runner.sh
RUN sudo chmod +x /home/user/register_runner.sh
ENTRYPOINT ["/home/user/register_runner.sh"]
