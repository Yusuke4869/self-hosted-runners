import type { Job } from "../../domain/job.ts";

export interface JobUseCaseInterface {
  enqueueJob(job: Omit<Job, "runnerStarted">): Promise<Job>;
  dequeueJob(id: number): Promise<void>;
}
