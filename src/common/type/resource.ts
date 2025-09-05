/** CPU と Memory の使用率 */
export interface ResourceUsage {
  readonly cpu: number | null;
  readonly memory: number | null;
}

/** CPU と Memory の閾値 */
export interface ResourceThreshold {
  readonly cpu: number;
  readonly memory: number;
}

/** リソースの状態 */
export interface ResourceStatus {
  readonly usage: ResourceUsage;
  readonly threshold: ResourceThreshold;
  /** リソースが利用可能かどうか */
  readonly available: boolean;
}
