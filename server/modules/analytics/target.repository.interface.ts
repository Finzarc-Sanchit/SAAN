import type { MonthlyTarget, UpsertMonthlyTargetInput } from './analytics.types';

export interface IMonthlyTargetRepository {
  findByMonthYear(month: number, year: number): Promise<MonthlyTarget | null>;
  findMany(): Promise<MonthlyTarget[]>;
  upsert(data: UpsertMonthlyTargetInput): Promise<MonthlyTarget>;
}
