import type { IMonthlyTargetRepository } from '../../../../modules/analytics/target.repository.interface';
import type {
  MonthlyTarget,
  UpsertMonthlyTargetInput,
} from '../../../../modules/analytics/analytics.types';
import {
  MonthlyTargetModel,
  type MonthlyTargetDocument,
} from '../models/monthly-target.model';

function toDomain(doc: MonthlyTargetDocument): MonthlyTarget {
  return {
    id: doc._id.toString(),
    month: doc.month,
    year: doc.year,
    targetAmount: doc.targetAmount,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoMonthlyTargetRepository implements IMonthlyTargetRepository {
  async findByMonthYear(month: number, year: number): Promise<MonthlyTarget | null> {
    const doc = await MonthlyTargetModel.findOne({ month, year })
      .lean<MonthlyTargetDocument>()
      .exec();
    return doc ? toDomain(doc) : null;
  }

  async findMany(): Promise<MonthlyTarget[]> {
    const docs = await MonthlyTargetModel.find()
      .sort({ year: -1, month: -1 })
      .lean<MonthlyTargetDocument[]>()
      .exec();
    return docs.map(toDomain);
  }

  async upsert(data: UpsertMonthlyTargetInput): Promise<MonthlyTarget> {
    const doc = await MonthlyTargetModel.findOneAndUpdate(
      { month: data.month, year: data.year },
      { $set: { targetAmount: data.targetAmount } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    )
      .lean<MonthlyTargetDocument>()
      .exec();

    if (!doc) {
      throw new Error('Failed to upsert monthly target');
    }

    return toDomain(doc);
  }
}
