export class Job {
  public readonly id: number;
  public readonly owner: string;
  public readonly repo: string;
  public readonly labels: string[];
  public runnerStarted: boolean;

  constructor(
    { id, owner, repo, labels }: {
      id: number;
      owner: string;
      repo: string;
      labels: string[];
    },
  ) {
    this.id = id;
    this.owner = owner;
    this.repo = repo;
    this.labels = labels;
    this.runnerStarted = false;
  }
}
