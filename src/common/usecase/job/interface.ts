import type { Job } from "../../domain/job.ts";

export interface JobPayload {
  id: number;
  owner: string;
  repo: string;
  runId?: number;
  labels: string[];
}

export interface JobUseCaseInterface {
  enqueueJob(job: JobPayload): Promise<Job>;
  markJobRunning(job: JobPayload): Promise<Job>;
  completeJob(id: number): Promise<void>;
  dequeueJob(id: number): Promise<void>;
}
