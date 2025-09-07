import { Job } from "../../domain/job.ts";

import type { JobUseCaseInterface } from "./interface.ts";
import type { JobRepositoryInterface } from "../../repository/item/interface.ts";

export class JobUseCase implements JobUseCaseInterface {
  constructor(private readonly jobRepository: JobRepositoryInterface) {}

  async enqueueJob(job: Omit<Job, "runnerStarted">): Promise<Job> {
    const res = await this.jobRepository.upsertJob(new Job({ ...job }));
    console.log(`${job.owner}/${job.repo}: Enqueued job #${job.id}`);
    return res;
  }

  async dequeueJob(id: number): Promise<void> {
    await this.jobRepository.deleteJob(id);
    console.log(`Dequeued job #${id}`);
  }
}
