import { Job } from "../../domain/job.ts";

import type { JobRepositoryInterface } from "../item/interface.ts";

export class JobRepository implements JobRepositoryInterface {
  constructor(private readonly kv: Deno.Kv) {}

  async findAllJobs(): Promise<Job[]> {
    const jobs: Job[] = [];

    try {
      const entries = this.kv.list<Job>({ prefix: ["jobs"] });
      for await (const entry of entries) {
        jobs.push(new Job({ ...entry.value }));
      }

      return jobs;
    } catch (e) {
      console.error(e);
      throw new Error("Failed to find all jobs");
    }
  }

  async findJob(id: number): Promise<Job | null> {
    try {
      const r = await this.kv.get<Job>(["jobs", id]);
      return r.value ? new Job({ ...r.value }) : null;
    } catch (e) {
      console.error(e);
      throw new Error("Failed to find job");
    }
  }

  async upsertJob(fields: Job): Promise<Job> {
    try {
      await this.kv.set(["jobs", fields.id], { ...fields });

      const res = await this.findJob(fields.id);
      if (!res) throw new Error("Failed to upsert job");
      return res;
    } catch (e) {
      console.error(e);
      throw new Error("Failed to upsert job");
    }
  }

  async updateJob(job: Job, fields: Partial<Omit<Job, "id">>): Promise<Job> {
    try {
      const res = await this.upsertJob({ ...job, ...fields });
      return res;
    } catch (e) {
      console.error(e);
      throw new Error("Failed to update job");
    }
  }

  async deleteJob(id: number): Promise<void> {
    try {
      await this.kv.delete(["jobs", id]);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to delete job");
    }
  }
}
