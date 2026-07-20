import { randomInt } from 'node:crypto';
import { ORDER_CONSTANTS } from '../../../modules/order/order.constants';
import { CounterModel } from './models/counter.model';
import { OrderModel } from './models/order.model';

/** Atomic sequence for uniqueness in the trailing segment. */
const ORDER_NUMBER_COUNTER_ID = 'orderNumber';
const MAX_ALLOCATION_ATTEMPTS = 12;

/**
 * Customer-facing order id — Amazon-style `###-#######-#######`
 * e.g. `407-1298468-3682757`
 */
export function formatOrderNumberParts(part1: number, part2: number, part3: number): string {
  return `${String(part1).padStart(3, '0')}-${String(part2).padStart(7, '0')}-${String(part3).padStart(7, '0')}`;
}

function buildCandidateOrderNumber(seq: number): string {
  const part1 = randomInt(100, 1000);
  const part2 = randomInt(0, 10_000_000);
  /** Counter-backed segment guarantees uniqueness across allocations. */
  const part3 = seq % 10_000_000;
  return formatOrderNumberParts(part1, part2, part3);
}

/**
 * Allocates the next customer-facing order number atomically.
 * Retries when a rare collision is detected against the unique index.
 */
export async function allocateOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ALLOCATION_ATTEMPTS; attempt += 1) {
    const doc = await CounterModel.findByIdAndUpdate(
      ORDER_NUMBER_COUNTER_ID,
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
      .lean()
      .exec();

    const seq = doc?.seq ?? 1;
    const orderNumber = buildCandidateOrderNumber(seq);

    if (!ORDER_CONSTANTS.ORDER_NUMBER_PATTERN.test(orderNumber)) {
      continue;
    }

    const exists = await OrderModel.findOne({ orderNumber }).select('_id').lean().exec();
    if (!exists) {
      return orderNumber;
    }
  }

  throw new Error('Unable to allocate a unique order number');
}
