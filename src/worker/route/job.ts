import { Hono } from "hono";

import { Kv } from "../../common/infrastructure/kv.ts";
import { githubMiddleware } from "../../common/middleware/github.ts";
import { JobRepository } from "../../common/repository/item/impl.ts";
import { githubWebhookController } from "../controller/job.ts";

const jobRepository = new JobRepository(await Kv.getKv());

export const jobRouter = new Hono()
  .get("/", async (c) => {
    const jobs = await jobRepository.findAllJobs();
    return c.json({
      status: "success",
      data: jobs,
    });
  })
  .post("/github", githubMiddleware, githubWebhookController);
