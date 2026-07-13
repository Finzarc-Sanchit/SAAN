export type IdempotencyClaimResult =
  | { type: 'existing'; resourceId: string }
  | { type: 'claimed' }
  | { type: 'in_progress' };

export interface IIdempotencyStore {
  claimOrGetExisting(
    scope: string,
    userId: string,
    idempotencyKey: string,
    ttlSeconds: number,
  ): Promise<IdempotencyClaimResult>;

  markComplete(
    scope: string,
    userId: string,
    idempotencyKey: string,
    resourceId: string,
    ttlSeconds: number,
  ): Promise<void>;

  markFailed(scope: string, userId: string, idempotencyKey: string): Promise<void>;
}
