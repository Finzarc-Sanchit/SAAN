import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type {
  AppointmentListQueryDto,
  CreateAppointmentDto,
  RescheduleAppointmentDto,
  UpdateAppointmentDto,
  UpdateAppointmentSettingsDto,
  UpdateAppointmentStatusDto,
} from './appointment.dto';
import type { AppointmentService } from './appointment.service';

/** HTTP adapter for public booking and administrative appointment operations. */
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  getPublicContext = async (_req: Request, res: Response): Promise<void> => {
    const context = await this.appointmentService.getPublicBookingContext();
    res.status(200).json(successResponse(context));
  };

  getAvailability = async (req: Request, res: Response): Promise<void> => {
    const { date } = req.query as { date: string };
    const availability = await this.appointmentService.getAvailability(date);
    res.status(200).json(successResponse(availability));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const appointment = await this.appointmentService.createAppointment(
      req.body as CreateAppointmentDto,
    );
    res.status(201).json(successResponse(appointment));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const { page, limit, status, search, dateFrom, dateTo, appointmentType } =
      req.query as unknown as AppointmentListQueryDto;
    const result = await this.appointmentService.listAppointments(
      { status, search, dateFrom, dateTo, appointmentType },
      { page, limit },
    );

    res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }),
    );
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const appointment = await this.appointmentService.getAppointment(id);
    res.status(200).json(successResponse(appointment));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const appointment = await this.appointmentService.updateAppointment(
      id,
      req.body as UpdateAppointmentDto,
    );
    res.status(200).json(successResponse(appointment));
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { status, note, cancellationReason } = req.body as UpdateAppointmentStatusDto;
    const changedBy = req.user?.email ?? req.user?.id;
    const appointment = await this.appointmentService.updateStatus(id, status, {
      note,
      cancellationReason,
      changedBy,
    });
    res.status(200).json(successResponse(appointment));
  };

  reschedule = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const body = req.body as RescheduleAppointmentDto;
    const changedBy = req.user?.email ?? req.user?.id;
    const appointment = await this.appointmentService.reschedule(id, {
      ...body,
      changedBy,
    });
    res.status(200).json(successResponse(appointment));
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    await this.appointmentService.deleteAppointment(id);
    res.status(200).json(successResponse({ message: 'Appointment deleted' }));
  };

  getSettings = async (_req: Request, res: Response): Promise<void> => {
    const settings = await this.appointmentService.getSettings();
    res.status(200).json(successResponse(settings));
  };

  updateSettings = async (req: Request, res: Response): Promise<void> => {
    const settings = await this.appointmentService.updateSettings(
      req.body as UpdateAppointmentSettingsDto,
    );
    res.status(200).json(successResponse(settings));
  };
}
