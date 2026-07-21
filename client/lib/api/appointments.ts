import { apiRequest, apiRequestWithMeta } from '@/lib/api/client';
import type { PaginationMeta } from '@/lib/types/api';
import type {
  AdminAppointmentListParams,
  Appointment,
  AppointmentSettings,
  CreateAppointmentInput,
  DayAvailability,
  PublicAppointmentContext,
  RescheduleAppointmentInput,
  UpdateAppointmentInput,
  UpdateAppointmentSettingsInput,
  UpdateAppointmentStatusInput,
} from '@/lib/types/appointment.schemas';

const PUBLIC_APPOINTMENTS_BASE = '/api/v1/appointments';
const ADMIN_APPOINTMENTS_BASE = '/api/v1/admin/appointments';
const ADMIN_SETTINGS_BASE = '/api/v1/admin/appointment-settings';

export const appointmentsQueryKeys = {
  all: ['appointments'] as const,
  context: () => [...appointmentsQueryKeys.all, 'context'] as const,
  availability: (date: string) => [...appointmentsQueryKeys.all, 'availability', date] as const,
  admin: {
    all: ['admin', 'appointments'] as const,
    list: (params: AdminAppointmentListParams) =>
      [...appointmentsQueryKeys.admin.all, 'list', params] as const,
    detail: (id: string) => [...appointmentsQueryKeys.admin.all, 'detail', id] as const,
    settings: () => [...appointmentsQueryKeys.admin.all, 'settings'] as const,
  },
};

function buildListQuery(params: AdminAppointmentListParams): string {
  const search = new URLSearchParams();
  if (params.search) search.set('search', params.search);
  if (params.status) search.set('status', params.status);
  if (params.dateFrom) search.set('dateFrom', params.dateFrom);
  if (params.dateTo) search.set('dateTo', params.dateTo);
  if (params.appointmentType) search.set('appointmentType', params.appointmentType);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return query ? `?${query}` : '';
}

export type AdminAppointmentListResult = {
  items: Appointment[];
  meta: PaginationMeta;
};

export async function getAppointmentContext(): Promise<PublicAppointmentContext> {
  return apiRequest<PublicAppointmentContext>(`${PUBLIC_APPOINTMENTS_BASE}/context`, {
    skipAuthRefresh: true,
  });
}

export async function getAppointmentAvailability(date: string): Promise<DayAvailability> {
  return apiRequest<DayAvailability>(
    `${PUBLIC_APPOINTMENTS_BASE}/availability?date=${encodeURIComponent(date)}`,
    { skipAuthRefresh: true },
  );
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  return apiRequest<Appointment>(PUBLIC_APPOINTMENTS_BASE, {
    method: 'POST',
    body: input,
    skipAuthRefresh: true,
  });
}

export async function listAdminAppointments(
  params: AdminAppointmentListParams = {},
): Promise<AdminAppointmentListResult> {
  const { data, meta } = await apiRequestWithMeta<Appointment[]>(
    `${ADMIN_APPOINTMENTS_BASE}${buildListQuery(params)}`,
  );

  return {
    items: data,
    meta: meta ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      total: data.length,
    },
  };
}

export async function getAdminAppointment(id: string): Promise<Appointment> {
  return apiRequest<Appointment>(`${ADMIN_APPOINTMENTS_BASE}/${id}`);
}

export async function updateAdminAppointment(
  id: string,
  input: UpdateAppointmentInput,
): Promise<Appointment> {
  return apiRequest<Appointment>(`${ADMIN_APPOINTMENTS_BASE}/${id}`, {
    method: 'PATCH',
    body: input,
  });
}

export async function updateAdminAppointmentStatus(
  id: string,
  input: UpdateAppointmentStatusInput,
): Promise<Appointment> {
  return apiRequest<Appointment>(`${ADMIN_APPOINTMENTS_BASE}/${id}/status`, {
    method: 'PATCH',
    body: input,
  });
}

export async function rescheduleAdminAppointment(
  id: string,
  input: RescheduleAppointmentInput,
): Promise<Appointment> {
  return apiRequest<Appointment>(`${ADMIN_APPOINTMENTS_BASE}/${id}/reschedule`, {
    method: 'POST',
    body: input,
  });
}

export async function deleteAdminAppointment(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`${ADMIN_APPOINTMENTS_BASE}/${id}`, {
    method: 'DELETE',
  });
}

export async function getAdminAppointmentSettings(): Promise<AppointmentSettings> {
  return apiRequest<AppointmentSettings>(ADMIN_SETTINGS_BASE);
}

export async function updateAdminAppointmentSettings(
  input: UpdateAppointmentSettingsInput,
): Promise<AppointmentSettings> {
  return apiRequest<AppointmentSettings>(ADMIN_SETTINGS_BASE, {
    method: 'PATCH',
    body: input,
  });
}
