import { Hono } from "hono";
import { logger } from "hono/logger";
import { resourceRouter } from "./route/resource.ts";

export const worker = new Hono()
  .use(logger())
  .get("/", (c) => c.text("Hello World!"))
  .route("/resources", resourceRouter);

if (import.meta.main) {
  Deno.serve(worker.fetch);
}
