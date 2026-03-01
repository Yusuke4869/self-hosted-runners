FROM denoland/deno:latest AS builder

WORKDIR /app

COPY deno.json deno.lock ./
COPY src/common/ ./src/common/
COPY src/worker/ ./src/worker/
COPY ./runner/ ./runner/

RUN deno cache src/worker/main.ts


FROM denoland/deno:ubuntu

WORKDIR /app
COPY --from=builder /app .

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    docker.io \
    bash \
    curl \
    jq && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/data && \
    chown -R deno:deno /app && \
    chmod 755 /app/data

USER deno

CMD ["deno", "task", "start:worker"]
