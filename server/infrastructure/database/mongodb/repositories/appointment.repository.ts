import { Types } from 'mongoose';
import type {
  BookedSlotSummary,
  CreateAppointmentRecordInput,
  IAppointmentRepository,
} from '../../../../modules/appointment/appointment.repository.interface';
import {
  SLOT_HOLDING_STATUSES,
  type AdminUpdateAppointmentInput,
  type Appointment,
  type AppointmentListFilter,
  type AppointmentReminder,
  type AppointmentStatus,
} from '../../../../modules/appointment/appointment.types';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import type { Paginated, Pagination } from '../../../../shared/types/pagination';
import { normalizePagination } from '../../../../shared/utils/pagination';
import { AppointmentModel, type AppointmentDocument } from '../models/appointment.model';

function toDomainAppointment(doc: AppointmentDocument): Appointment {
  return {
    id: doc._id.toString(),
    referenceCode: doc.referenceCode,
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    phone: doc.phone,
    appointmentDate: doc.appointmentDate,
    timeSlot: doc.timeSlot,
    durationMinutes: doc.durationMinutes,
    appointmentType: doc.appointmentType,
    notes: doc.notes,
    status: doc.status,
    statusHistory: doc.statusHistory ?? [],
    cancellationReason: doc.cancellationReason,
    reschedule: doc.reschedule,
    emailNotifications: {
      confirmationSentAt: doc.emailNotifications?.confirmationSentAt,
      adminNotificationSentAt: doc.emailNotifications?.adminNotificationSentAt,
      statusEmails: doc.emailNotifications?.statusEmails ?? [],
    },
    reminder: {
      status: doc.reminder?.status ?? 'pending',
      scheduledFor: doc.reminder?.scheduledFor,
      sentAt: doc.reminder?.sentAt,
    },
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildQuery(filter: AppointmentListFilter): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  if (filter.status) {
    query.status = filter.status;
  }
  if (filter.appointmentType) {
    query.appointmentType = filter.appointmentType;
  }
  if (filter.dateFrom || filter.dateTo) {
    const dateRange: Record<string, string> = {};
    if (filter.dateFrom) dateRange.$gte = filter.dateFrom;
    if (filter.dateTo) dateRange.$lte = filter.dateTo;
    query.appointmentDate = dateRange;
  }
  if (filter.search) {
    const search = new RegExp(escapeRegex(filter.search.trim()), 'i');
    query.$or = [
      { firstName: search },
      { lastName: search },
      { email: search },
      { phone: search },
      { referenceCode: search },
      { appointmentType: search },
    ];
  }

  return query;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  );
}

export class MongoAppointmentRepository implements IAppointmentRepository {
  async create(data: CreateAppointmentRecordInput): Promise<Appointment> {
    try {
      const now = new Date();
      const doc = await AppointmentModel.create({
        ...data,
        email: data.email.trim().toLowerCase(),
        statusHistory: [{ status: data.status, at: now }],
        emailNotifications: { statusEmails: [] },
        reminder: { status: 'pending' },
      });
      return toDomainAppointment(doc.toObject() as AppointmentDocument);
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw error;
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Appointment | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await AppointmentModel.findById(id).lean<AppointmentDocument>().exec();
    return doc ? toDomainAppointment(doc) : null;
  }

  async findMany(
    filter: AppointmentListFilter,
    pagination: Pagination,
  ): Promise<Paginated<Appointment>> {
    const { page, limit, skip } = normalizePagination(pagination);
    const query = buildQuery(filter);
    const [docs, total] = await Promise.all([
      AppointmentModel.find(query)
        .sort({ appointmentDate: 1, timeSlot: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<AppointmentDocument[]>()
        .exec(),
      AppointmentModel.countDocuments(query).exec(),
    ]);
    return { items: docs.map(toDomainAppointment), page, limit, total };
  }

  async update(id: string, data: AdminUpdateAppointmentInput): Promise<Appointment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Appointment not found');
    }

    const $set: Record<string, unknown> = {};
    const $unset: Record<string, 1> = {};

    for (const key of [
      'firstName',
      'lastName',
      'email',
      'phone',
      'appointmentType',
      'appointmentDate',
      'timeSlot',
      'cancellationReason',
    ] as const) {
      if (data[key] !== undefined) {
        $set[key] = data[key];
      }
    }

    if (data.notes === null) {
      $unset.notes = 1;
    } else if (data.notes !== undefined) {
      $set.notes = data.notes;
    }

    if (data.email) {
      $set.email = data.email.trim().toLowerCase();
    }

    try {
      const doc = await AppointmentModel.findByIdAndUpdate(
        id,
        { ...(Object.keys($set).length ? { $set } : {}), ...(Object.keys($unset).length ? { $unset } : {}) },
        { new: true, runValidators: true },
      )
        .lean<AppointmentDocument>()
        .exec();

      if (!doc) {
        throw new NotFoundError('Appointment not found');
      }
      return toDomainAppointment(doc);
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw error;
      }
      throw error;
    }
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    options: { note?: string; cancellationReason?: string; changedBy?: string } = {},
  ): Promise<Appointment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Appointment not found');
    }

    const $set: Record<string, unknown> = { status };
    if (options.cancellationReason !== undefined) {
      $set.cancellationReason = options.cancellationReason;
    }

    const doc = await AppointmentModel.findByIdAndUpdate(
      id,
      {
        $set,
        $push: {
          statusHistory: {
            status,
            at: new Date(),
            note: options.note,
            changedBy: options.changedBy,
          },
        },
      },
      { new: true, runValidators: true },
    )
      .lean<AppointmentDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Appointment not found');
    }
    return toDomainAppointment(doc);
  }

  async reschedule(
    id: string,
    data: {
      appointmentDate: string;
      timeSlot: string;
      reason?: string;
      changedBy?: string;
    },
  ): Promise<Appointment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Appointment not found');
    }

    const existing = await AppointmentModel.findById(id).lean<AppointmentDocument>().exec();
    if (!existing) {
      throw new NotFoundError('Appointment not found');
    }

    const now = new Date();

    try {
      const doc = await AppointmentModel.findByIdAndUpdate(
        id,
        {
          $set: {
            appointmentDate: data.appointmentDate,
            timeSlot: data.timeSlot,
            status: 'rescheduled',
            reschedule: {
              previousDate: existing.appointmentDate,
              previousTimeSlot: existing.timeSlot,
              rescheduledAt: now,
              reason: data.reason,
            },
            reminder: { status: 'pending' },
          },
          $push: {
            statusHistory: {
              status: 'rescheduled' as const,
              at: now,
              note: data.reason,
              changedBy: data.changedBy,
            },
          },
        },
        { new: true, runValidators: true },
      )
        .lean<AppointmentDocument>()
        .exec();

      if (!doc) {
        throw new NotFoundError('Appointment not found');
      }
      return toDomainAppointment(doc);
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw error;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Appointment not found');
    }
    const doc = await AppointmentModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundError('Appointment not found');
    }
  }

  async findBookedSlotsForDate(date: string): Promise<BookedSlotSummary[]> {
    const rows = await AppointmentModel.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          appointmentDate: date,
          status: { $in: [...SLOT_HOLDING_STATUSES] },
        },
      },
      { $group: { _id: '$timeSlot', count: { $sum: 1 } } },
    ]).exec();

    return rows.map((row) => ({ timeSlot: row._id, count: row.count }));
  }

  async countActiveForDate(date: string): Promise<number> {
    return AppointmentModel.countDocuments({
      appointmentDate: date,
      status: { $in: [...SLOT_HOLDING_STATUSES] },
    }).exec();
  }

  async isSlotTaken(date: string, timeSlot: string, excludeId?: string): Promise<boolean> {
    const query: Record<string, unknown> = {
      appointmentDate: date,
      timeSlot,
      status: { $in: [...SLOT_HOLDING_STATUSES] },
    };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }
    const count = await AppointmentModel.countDocuments(query).exec();
    return count > 0;
  }

  async updateReminder(id: string, reminder: AppointmentReminder): Promise<Appointment> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Appointment not found');
    }
    const doc = await AppointmentModel.findByIdAndUpdate(
      id,
      { $set: { reminder } },
      { new: true, runValidators: true },
    )
      .lean<AppointmentDocument>()
      .exec();
    if (!doc) {
      throw new NotFoundError('Appointment not found');
    }
    return toDomainAppointment(doc);
  }

  async markReminderSent(id: string, sentAt: Date = new Date()): Promise<Appointment | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await AppointmentModel.findOneAndUpdate(
      {
        _id: id,
        'reminder.status': { $ne: 'sent' },
      },
      {
        $set: {
          reminder: {
            status: 'sent',
            sentAt,
          },
        },
      },
      { new: true },
    )
      .lean<AppointmentDocument>()
      .exec();
    return doc ? toDomainAppointment(doc) : null;
  }

  async markEmailNotification(
    id: string,
    patch: {
      confirmationSentAt?: Date;
      adminNotificationSentAt?: Date;
      statusEmail?: { status: AppointmentStatus; sentAt: Date };
    },
  ): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      return;
    }

    const $set: Record<string, unknown> = {};
    if (patch.confirmationSentAt) {
      $set['emailNotifications.confirmationSentAt'] = patch.confirmationSentAt;
    }
    if (patch.adminNotificationSentAt) {
      $set['emailNotifications.adminNotificationSentAt'] = patch.adminNotificationSentAt;
    }

    const update: Record<string, unknown> = {};
    if (Object.keys($set).length) {
      update.$set = $set;
    }
    if (patch.statusEmail) {
      update.$push = { 'emailNotifications.statusEmails': patch.statusEmail };
    }

    if (Object.keys(update).length === 0) {
      return;
    }

    await AppointmentModel.findByIdAndUpdate(id, update).exec();
  }
}
