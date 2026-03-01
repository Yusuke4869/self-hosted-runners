import { Kv } from "../../common/infrastructure/kv.ts";
import { JobRepository } from "../../common/repository/item/impl.ts";
import { JobUseCase } from "../../common/usecase/job/impl.ts";

import type { WorkflowJobEvent } from "@octokit/webhooks-types";
import type { Context } from "hono";

const jobUseCase = new JobUseCase(new JobRepository(await Kv.getKv()));

export const githubWebhookController = async (c: Context) => {
  try {
    const event = c.req.header("x-github-event");
    if (!event || event !== "workflow_job") {
      return c.json({ message: "Invalid event" }, 400);
    }

    const body = await c.req.json() as WorkflowJobEvent;
    const { action, workflow_job, repository } = body;

    if (action === "waiting") {
      return c.json({ message: "Skipped waiting action" }, 200);
    }

    const { id: jobId, run_id: runId, labels } = workflow_job;
    const { name: repo, owner: { login: owner } } = repository;

    const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    console.log(
      `[${now}] Received workflow_job event: ${owner}/${repo} run#${runId} job#${jobId} (${action})`,
    );

    const payload = { id: jobId, runId, repo, owner, labels };

    if (action === "queued") {
      await jobUseCase.enqueueJob(payload);
      return c.json({ message: `Enqueued job ${jobId}` }, 200);
    }

    if (action === "in_progress") {
      await jobUseCase.markJobRunning(payload);
      return c.json({ message: `Marked running job ${jobId}` }, 200);
    }

    if (action === "completed") {
      await jobUseCase.completeJob(jobId);
      return c.json({ message: `Completed job ${jobId}` }, 200);
    }

    return c.json({ message: `Ignored action ${action}` }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Internal Server Error" }, 500);
  }
};
