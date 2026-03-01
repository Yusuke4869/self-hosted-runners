import { Job, JOB_STATUS } from "../../domain/job.ts";

import type { JobUseCaseInterface } from "./interface.ts";
import type { JobPayload } from "./interface.ts";
import type { JobRepositoryInterface } from "../../repository/item/interface.ts";

export class JobUseCase implements JobUseCaseInterface {
  constructor(private readonly jobRepository: JobRepositoryInterface) {}

  async enqueueJob(job: JobPayload): Promise<Job> {
    const existing = await this.jobRepository.findJob(job.id);

    if (existing) {
      const res = await this.jobRepository.updateJob(existing, {
        owner: job.owner,
        repo: job.repo,
        runId: job.runId,
        labels: job.labels,
        status: JOB_STATUS.PENDING,
        leaseUntil: undefined,
        containerId: undefined,
        containerName: undefined,
      });
      console.log(`${job.owner}/${job.repo}: Re-queued job #${job.id}`);
      return res;
    }

    const res = await this.jobRepository.upsertJob(
      new Job({
        ...job,
        status: JOB_STATUS.PENDING,
      }),
    );
    console.log(`${job.owner}/${job.repo}: Enqueued job #${job.id}`);
    return res;
  }

  async markJobRunning(job: JobPayload): Promise<Job> {
    const now = new Date().toISOString();
    const existing = await this.jobRepository.findJob(job.id);

    if (existing) {
      const res = await this.jobRepository.updateJob(existing, {
        owner: job.owner,
        repo: job.repo,
        runId: job.runId,
        labels: job.labels,
        status: JOB_STATUS.RUNNING,
        leaseUntil: undefined,
        startedAt: existing.startedAt ?? now,
      });
      return res;
    }

    return await this.jobRepository.upsertJob(
      new Job({
        ...job,
        status: JOB_STATUS.RUNNING,
        startedAt: now,
      }),
    );
  }

  async completeJob(id: number): Promise<void> {
    const job = await this.jobRepository.findJob(id);
    if (job) {
      console.log(`${job.owner}/${job.repo}: Completed job #${id}`);
    } else {
      console.log(`Completed unknown job #${id}`);
    }

    await this.dequeueJob(id);
  }

  async dequeueJob(id: number): Promise<void> {
    await this.jobRepository.deleteJob(id);
    console.log(`Dequeued job #${id}`);
  }
}
