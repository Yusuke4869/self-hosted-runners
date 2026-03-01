import { Job } from "../../domain/job.ts";
import { JOB_STATUS } from "../../domain/job.ts";

import type { JobRepositoryInterface } from "../item/interface.ts";

const isLeaseExpired = (
  leaseUntil: string | undefined,
  nowMs: number,
): boolean => {
  if (!leaseUntil) return true;
  const leaseMs = Date.parse(leaseUntil);
  if (Number.isNaN(leaseMs)) return true;
  return leaseMs <= nowMs;
};

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

  async claimNextRunnableJob(leaseMs: number): Promise<Job | null> {
    const now = Date.now();
    const leaseUntil = new Date(now + leaseMs).toISOString();
    const entries = this.kv.list<Job>({ prefix: ["jobs"] });

    try {
      for await (const entry of entries) {
        const job = new Job({ ...entry.value });
        const claimable = job.status === JOB_STATUS.PENDING ||
          (job.status === JOB_STATUS.ASSIGNED &&
            isLeaseExpired(job.leaseUntil, now));

        if (!claimable) continue;

        const claimedJob = new Job({
          ...job,
          status: JOB_STATUS.ASSIGNED,
          attempt: job.attempt + 1,
          leaseUntil,
          updatedAt: new Date(now).toISOString(),
        });

        const result = await this.kv.atomic()
          .check(entry)
          .set(entry.key, { ...claimedJob })
          .commit();

        if (result.ok) return claimedJob;
      }
    } catch (e) {
      console.error(e);
      throw new Error("Failed to claim next runnable job");
    }

    return null;
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
      const res = await this.upsertJob(
        new Job({ ...job, ...fields, updatedAt: new Date().toISOString() }),
      );
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
