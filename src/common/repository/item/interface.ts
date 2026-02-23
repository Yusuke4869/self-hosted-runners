import type { Job } from "../../domain/job.ts";

export interface JobRepositoryInterface {
  findAllJobs(): Promise<Job[]>;
  findJob(id: number): Promise<Job | null>;
  upsertJob(job: Job): Promise<Job>;
  updateJob(job: Job, fields: Partial<Omit<Job, "id">>): Promise<Job>;
  deleteJob(id: number): Promise<void>;
}
