interface NumberEnvOptions {
  defaultValue?: number;
  min?: number;
  max?: number;
  required?: boolean;
}

const getStringEnv = (key: string): string | undefined => {
  const value = Deno.env.get(key);
  return value?.trim() ? value : undefined;
};

const getRequiredStringEnv = (key: string): string => {
  const value = getStringEnv(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getNumberEnv = (key: string, options: NumberEnvOptions): number => {
  const raw = Deno.env.get(key);
  if (!raw) {
    if (options.required || options.defaultValue === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return options.defaultValue;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }

  if (options.min !== undefined && parsed < options.min) {
    throw new Error(
      `Environment variable ${key} must be greater than or equal to ${options.min}`,
    );
  }

  if (options.max !== undefined && parsed > options.max) {
    throw new Error(
      `Environment variable ${key} must be less than or equal to ${options.max}`,
    );
  }
  return parsed;
};

export const env = {
  KV_PATH: getStringEnv("KV_PATH"),
  GITHUB_WEBHOOK_SECRET: getRequiredStringEnv("GITHUB_WEBHOOK_SECRET"),
  GITHUB_PERSONAL_ACCESS_TOKEN: getRequiredStringEnv(
    "GITHUB_PERSONAL_ACCESS_TOKEN",
  ),
  JOB_POLL_INTERVAL_MS: getNumberEnv("JOB_POLL_INTERVAL_MS", {
    defaultValue: 5000,
    min: 1000,
  }),
  JOB_ASSIGN_LEASE_MS: getNumberEnv("JOB_ASSIGN_LEASE_MS", {
    defaultValue: 900000,
    min: 1000,
  }),
  RESOURCE_CPU_THRESHOLD: getNumberEnv("RESOURCE_CPU_THRESHOLD", {
    defaultValue: 75,
    min: 0,
    max: 100,
  }),
  RESOURCE_MEMORY_THRESHOLD: getNumberEnv("RESOURCE_MEMORY_THRESHOLD", {
    defaultValue: 75,
    min: 0,
    max: 100,
  }),
};
