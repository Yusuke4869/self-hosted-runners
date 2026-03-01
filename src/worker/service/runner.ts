import type { Job } from "../../common/domain/job.ts";
import { env } from "../../common/env.ts";

const RUNNER_IMAGE = "actions-runner:latest";
const RUNNER_BUILD_SCRIPT = "./runner/build.sh";
const BUILD_RETRY_COOLDOWN_MS = 600_000;

let imagePrepared = false;
let imageBuildPromise: Promise<void> | null = null;
let nextBuildAttemptAt = 0;

export interface RunnerContainer {
  containerId: string;
  containerName: string;
}

const runCommand = async (
  command: string,
  args: string[],
): Promise<string> => {
  const process = new Deno.Command(command, {
    args,
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await process.output();
  const out = new TextDecoder().decode(stdout).trim();
  const err = new TextDecoder().decode(stderr).trim();

  if (code !== 0) {
    throw new Error(
      `Command failed (${command} ${args.join(" ")}): ${err || out}`,
    );
  }

  return out;
};

const hasRunnerImage = async (): Promise<boolean> => {
  try {
    await runCommand("docker", ["image", "inspect", RUNNER_IMAGE]);
    return true;
  } catch {
    return false;
  }
};

const findContainerIdByName = async (
  containerName: string,
): Promise<string | null> => {
  try {
    const output = await runCommand("docker", [
      "container",
      "inspect",
      "--format",
      "{{.State.Running}} {{.Id}}",
      containerName,
    ]);

    const [running, containerId] = output.split(" ");
    if (running !== "true") return null;
    return containerId || null;
  } catch {
    return null;
  }
};

const ensureRunnerImage = async (): Promise<void> => {
  if (imagePrepared) return;

  if (await hasRunnerImage()) {
    imagePrepared = true;
    return;
  }

  if (imageBuildPromise) {
    await imageBuildPromise;
    return;
  }

  if (Date.now() < nextBuildAttemptAt) {
    throw new Error(
      `Runner image build is in cooldown until ${
        new Date(nextBuildAttemptAt).toISOString()
      }`,
    );
  }

  imageBuildPromise = (async () => {
    console.log(
      `Runner image "${RUNNER_IMAGE}" is missing. Building with ${RUNNER_BUILD_SCRIPT}...`,
    );

    try {
      await runCommand("bash", [RUNNER_BUILD_SCRIPT]);
      if (!(await hasRunnerImage())) {
        throw new Error(
          `Runner image "${RUNNER_IMAGE}" was not found after build`,
        );
      }

      imagePrepared = true;
      nextBuildAttemptAt = 0;
    } catch (error) {
      imagePrepared = false;
      nextBuildAttemptAt = Date.now() + BUILD_RETRY_COOLDOWN_MS;
      throw error;
    } finally {
      imageBuildPromise = null;
    }
  })();

  await imageBuildPromise;
};

const toContainerName = (job: Job): string => {
  const owner = job.owner.toLowerCase().replaceAll(/[^a-z0-9_.-]/g, "-");
  const repo = job.repo.toLowerCase().replaceAll(/[^a-z0-9_.-]/g, "-");
  return `actions-${owner}-${repo}-${job.id}`;
};

export const startRunnerContainer = async (
  job: Job,
): Promise<RunnerContainer> => {
  await ensureRunnerImage();
  const containerName = toContainerName(job);

  const existingContainerId = await findContainerIdByName(containerName);
  if (existingContainerId) {
    return {
      containerId: existingContainerId,
      containerName,
    };
  }

  const containerId = await runCommand("docker", [
    "run",
    "--detach",
    "--rm",
    "--platform",
    "linux/x86_64",
    "--name",
    containerName,
    "-e",
    `GITHUB_PERSONAL_ACCESS_TOKEN=${env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
    "-e",
    `OWNER=${job.owner}`,
    "-e",
    `REPO=${job.repo}`,
    RUNNER_IMAGE,
  ]);

  return {
    containerId,
    containerName,
  };
};
