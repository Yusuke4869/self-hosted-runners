import { env } from "../../common/env.ts";
import { JOB_STATUS } from "../../common/domain/job.ts";
import { Kv } from "../../common/infrastructure/kv.ts";
import { JobRepository } from "../../common/repository/item/impl.ts";
import { getResourceAvailability } from "./resource.ts";
import { startRunnerContainer } from "../service/runner.ts";

const jobRepository = new JobRepository(await Kv.getKv());

let inProgress = false;
let intervalId: number | undefined;

const processQueuedJob = async (): Promise<void> => {
  if (inProgress) return;
  inProgress = true;

  try {
    const available = await getResourceAvailability();
    if (!available) return;

    const job = await jobRepository.claimNextRunnableJob(
      env.JOB_ASSIGN_LEASE_MS,
    );
    if (!job) return;

    // 一気にジョブを処理してリソースが足りなくなるのを防ぐため、1つずつ処理する
    try {
      const { containerId, containerName } = await startRunnerContainer(job);
      const runningJob = await jobRepository.updateJob(job, {
        status: JOB_STATUS.RUNNING,
        leaseUntil: undefined,
        containerId,
        containerName,
        startedAt: job.startedAt ?? new Date().toISOString(),
      });

      console.log(
        `${runningJob.owner}/${runningJob.repo}: Started runner for job #${runningJob.id} (${containerName})`,
      );
    } catch (error) {
      await jobRepository.updateJob(job, {
        status: JOB_STATUS.PENDING,
        leaseUntil: undefined,
      });
      throw error;
    }
  } catch (error) {
    console.error("Failed to process queued job: ", error);
  } finally {
    inProgress = false;
  }
};

export const startJobProcessor = (): void => {
  if (intervalId !== undefined) return;

  intervalId = setInterval(() => {
    void processQueuedJob();
  }, env.JOB_POLL_INTERVAL_MS);
  void processQueuedJob();

  console.log(
    `Job processor started (interval: ${env.JOB_POLL_INTERVAL_MS}ms)`,
  );
};
