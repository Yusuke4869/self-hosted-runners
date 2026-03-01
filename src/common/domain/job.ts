export const JOB_STATUS = {
  PENDING: "pending",
  ASSIGNED: "assigned",
  RUNNING: "running",
} as const;

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];

interface JobParams {
  /** GitHub workflow job ID */
  id: number;
  /** Repository owner */
  owner: string;
  /** Repository name */
  repo: string;
  /** GitHub workflow run ID */
  runId?: number;
  /** GitHub job labels */
  labels?: string[];
  /** ローカルで管理するジョブ状態 */
  status?: JobStatus;
  /** runner 起動試行回数 */
  attempt?: number;
  /** 起動した runner コンテナ名 */
  containerName?: string;
  /** 起動した runner コンテナID */
  containerId?: string;
  /** ASSIGNED 状態のリース期限 (ISO 8601) */
  leaseUntil?: string;
  /** 作成日時 (ISO 8601) */
  createdAt?: string;
  /** 最終更新日時 (ISO 8601) */
  updatedAt?: string;
  /** 実行開始日時 (ISO 8601) */
  startedAt?: string;
}

export class Job {
  public readonly id: number;
  public readonly owner: string;
  public readonly repo: string;
  public readonly runId?: number;
  public readonly labels: string[];
  public status: JobStatus;
  public attempt: number;
  public containerName?: string;
  public containerId?: string;
  public leaseUntil?: string;
  public readonly createdAt: string;
  public updatedAt: string;
  public startedAt?: string;

  constructor(params: JobParams) {
    const now = new Date().toISOString();
    const status = params.status ??
      (params.startedAt ? JOB_STATUS.RUNNING : JOB_STATUS.PENDING);

    const labels = params.labels ?? [];

    const createdAt = params.createdAt ?? now;
    const updatedAt = params.updatedAt ?? now;

    const {
      id,
      owner,
      repo,
      runId,
      attempt,
      containerName,
      containerId,
      leaseUntil,
      startedAt,
    } = params;

    this.id = id;
    this.owner = owner;
    this.repo = repo;
    this.runId = runId;
    this.labels = labels;
    this.status = status;
    this.attempt = attempt ?? 0;
    this.containerName = containerName;
    this.containerId = containerId;
    this.leaseUntil = leaseUntil;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.startedAt = startedAt;
  }
}
