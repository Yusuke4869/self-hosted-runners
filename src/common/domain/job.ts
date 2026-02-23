export class Job {
  public readonly id: number;
  public readonly owner: string;
  public readonly repo: string;
  public readonly labels: string[];
  public runnerStarted: boolean;

  constructor(
    { id, owner, repo, labels, runnerStarted }: {
      id: number;
      owner: string;
      repo: string;
      labels: string[];
      runnerStarted?: boolean;
    },
  ) {
    this.id = id;
    this.owner = owner;
    this.repo = repo;
    this.labels = labels;
    this.runnerStarted = runnerStarted ?? false;
  }
}
