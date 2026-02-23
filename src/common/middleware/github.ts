import { Webhooks } from "@octokit/webhooks";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

const GITHUB_WEBHOOK_SECRET = Deno.env.get("GITHUB_WEBHOOK_SECRET");
const webhooks = GITHUB_WEBHOOK_SECRET
  ? new Webhooks({
    secret: GITHUB_WEBHOOK_SECRET,
  })
  : null;

// ref: https://docs.github.com/ja/webhooks/using-webhooks/validating-webhook-deliveries#typescript-example
export const githubMiddleware = createMiddleware(async (c, next) => {
  if (!webhooks) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const signature = c.req.header("x-hub-signature-256");
  const body = await c.req.text();

  if (!signature || !(await webhooks.verify(body, signature))) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  await next();
});
