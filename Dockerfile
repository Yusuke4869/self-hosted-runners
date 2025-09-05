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

RUN chown -R deno:deno /app
USER deno

CMD ["deno", "task", "start:worker"]
