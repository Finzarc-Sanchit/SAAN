export interface ILoginLockoutStore {
  isLocked(email: string): Promise<boolean>;
  recordFailure(email: string): Promise<number>;
  clearFailures(email: string): Promise<void>;
  getMaxAttempts(): number;
  getLockoutSeconds(): number;
}
