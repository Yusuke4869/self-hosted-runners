import { Hono } from "hono";
import { logger } from "hono/logger";

import { jobRouter } from "./route/job.ts";
import { resourceRouter } from "./route/resource.ts";

export const worker = new Hono()
  .use(logger())
  .get("/", (c) => c.text("Hello World!"))
  .route("/jobs", jobRouter)
  .route("/resources", resourceRouter);

if (import.meta.main) {
  Deno.serve(worker.fetch);
}
