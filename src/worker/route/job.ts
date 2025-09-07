import { Hono } from "hono";

import { githubMiddleware } from "../../common/middleware/github.ts";
import { githubWebhookController } from "../controller/job.ts";

export const jobRouter = new Hono()
  .post("/github", githubMiddleware, githubWebhookController);
