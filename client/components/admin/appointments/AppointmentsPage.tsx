'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Trash2 } from 'lucide-react';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard, AdminInlineError, AdminSkeleton } from '@/components/admin/ui/AdminCard';
import {
  AdminDataTable,
  type AdminTableColumn,
} from '@/components/admin/ui/AdminDataTable';
import { adminInputClassName } from '@/components/admin/ui/AdminFormField';
import { AdminPagination } from '@/components/admin/ui/AdminPagination';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { ModalShell } from '@/components/ui/ModalShell';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatAdminDate } from '@/lib/admin/date-range-status';
import {
  appointmentsQueryKeys,
  deleteAdminAppointment,
  getAdminAppointment,
  listAdminAppointments,
  rescheduleAdminAppointment,
  updateAdminAppointment,
  updateAdminAppointmentStatus,
} from '@/lib/api/appointments';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUSES,
  type Appointment,
  type AppointmentStatus,
} from '@/lib/types/appointment.schemas';
import { cn } from '@/lib/utils';

const PAGE_LIMIT = 20;

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]',
        status === 'pending' &&
          'bg-amber-500/10 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200',
        status === 'confirmed' &&
          'bg-emerald-500/10 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300',
        status === 'completed' &&
          'bg-saan-maroon/10 text-ink dark:text-ink',
        status === 'cancelled' &&
          'bg-saan-champagne/45 text-saan-ink/65 dark:bg-white/10 dark:text-paper/65',
        status === 'rejected' &&
          'bg-red-500/10 text-red-800 dark:bg-red-400/10 dark:text-red-300',
        status === 'no_show' &&
          'bg-orange-500/10 text-orange-800 dark:bg-orange-400/10 dark:text-orange-200',
        status === 'rescheduled' &&
          'bg-sky-500/10 text-sky-800 dark:bg-sky-400/10 dark:text-sky-200',
      )}
    >
      {APPOINTMENT_STATUS_LABELS[status]}
    </span>
  );
}

type StatusAction = Exclude<AppointmentStatus, 'rescheduled' | 'pending'>;

const STATUS_ACTIONS: Array<{ status: StatusAction; label: string }> = [
  { status: 'confirmed', label: 'Confirm' },
  { status: 'rejected', label: 'Reject' },
  { status: 'cancelled', label: 'Cancel' },
  { status: 'completed', label: 'Complete' },
  { status: 'no_show', label: 'No show' },
];

export function AppointmentsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { toast } = useAdminToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AppointmentStatus | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const deepLinkId = searchParams.get('id');
    if (deepLinkId) {
      setSelectedId(deepLinkId);
    }
  }, [searchParams]);
  const [pendingDelete, setPendingDelete] = useState<Appointment | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch.trim() || undefined,
      status: status === 'all' ? undefined : status,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [dateFrom, dateTo, debouncedSearch, page, status],
  );

  const listQuery = useQuery({
    queryKey: appointmentsQueryKeys.admin.list(listParams),
    queryFn: () => listAdminAppointments(listParams),
  });

  const detailQuery = useQuery({
    queryKey: appointmentsQueryKeys.admin.detail(selectedId ?? ''),
    queryFn: () => getAdminAppointment(selectedId!),
    enabled: Boolean(selectedId),
  });

  const detail = detailQuery.data;

  useEffect(() => {
    if (!selectedId || !detail || detail.id !== selectedId) return;
    setNotesDraft(detail.notes ?? '');
    setRescheduleDate(detail.appointmentDate);
    setRescheduleTime(detail.timeSlot);
  }, [selectedId, detail]);

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      nextStatus,
      note,
      reason,
    }: {
      id: string;
      nextStatus: AppointmentStatus;
      note?: string;
      reason?: string;
    }) =>
      updateAdminAppointmentStatus(id, {
        status: nextStatus,
        note: note || undefined,
        cancellationReason: reason || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.admin.all });
      toast('Appointment status updated');
      setStatusNote('');
      setCancellationReason('');
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError
          ? getApiErrorMessage(error)
          : 'Could not update appointment status',
        'error',
      );
    },
  });

  const notesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string | null }) =>
      updateAdminAppointment(id, { notes }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.admin.all });
      toast('Notes saved');
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not save notes',
        'error',
      );
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({
      id,
      appointmentDate,
      timeSlot,
      reason,
    }: {
      id: string;
      appointmentDate: string;
      timeSlot: string;
      reason?: string;
    }) =>
      rescheduleAdminAppointment(id, {
        appointmentDate,
        timeSlot,
        reason: reason || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.admin.all });
      toast('Appointment rescheduled');
      setRescheduleReason('');
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError
          ? getApiErrorMessage(error)
          : 'Could not reschedule appointment',
        'error',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminAppointment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: appointmentsQueryKeys.admin.all });
      toast('Appointment deleted');
      setPendingDelete(null);
      if (selectedId === pendingDelete?.id) setSelectedId(null);
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not delete appointment',
        'error',
      );
    },
  });

  const columns = useMemo<AdminTableColumn<Appointment>[]>(
    () => [
      {
        id: 'guest',
        header: 'Guest',
        cell: (row) => (
          <div className="min-w-40">
            <p className="font-medium">
              {row.firstName} {row.lastName}
            </p>
            <a
              href={`mailto:${row.email}`}
              className="text-xs text-saan-ink/55 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saan-maroon/30 dark:text-paper/55"
            >
              {row.email}
            </a>
            <p className="text-xs text-saan-ink/45 dark:text-paper/45">{row.referenceCode}</p>
          </div>
        ),
      },
      {
        id: 'schedule',
        header: 'Schedule',
        cell: (row) => (
          <div className="min-w-36 whitespace-nowrap">
            <p className="font-medium">{row.appointmentDate}</p>
            <p className="text-xs text-saan-ink/55 dark:text-paper/55">{row.timeSlot}</p>
          </div>
        ),
      },
      {
        id: 'type',
        header: 'Type',
        cell: (row) => (
          <span className="line-clamp-2 min-w-36 text-sm capitalize">
            {row.appointmentType.replace(/_/g, ' ')}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        id: 'received',
        header: 'Received',
        cell: (row) => (
          <time
            dateTime={row.createdAt}
            className="whitespace-nowrap text-saan-ink/70 dark:text-paper/70"
          >
            {formatAdminDate(row.createdAt)}
          </time>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (row) => (
          <div className="inline-flex items-center justify-end gap-1">
            <AdminButton
              variant="ghost"
              className="px-2 py-1.5"
              onClick={() => setSelectedId(row.id)}
              aria-label={`View appointment for ${row.firstName} ${row.lastName}`}
            >
              <Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              View
            </AdminButton>
            <AdminButton
              variant="danger"
              className="px-2 py-1.5"
              onClick={() => setPendingDelete(row)}
              aria-label={`Delete appointment for ${row.firstName} ${row.lastName}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Delete
            </AdminButton>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-paper/45">
          Atelier
        </p>
        <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
          Appointments
        </h1>
      </div>

      <AdminCard>
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block space-y-1.5 md:col-span-2 xl:col-span-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              Search
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Name, email, phone or reference…"
              className={adminInputClassName}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              Status
            </span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as AppointmentStatus | 'all');
                setPage(1);
              }}
              className={adminInputClassName}
            >
              <option value="all">All statuses</option>
              {APPOINTMENT_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {APPOINTMENT_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
                From
              </span>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  setPage(1);
                }}
                className={adminInputClassName}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
                To
              </span>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setPage(1);
                }}
                className={adminInputClassName}
              />
            </label>
          </div>
        </div>

        <AdminDataTable
          columns={columns}
          data={listQuery.data?.items ?? []}
          rowKey={(row) => row.id}
          isLoading={listQuery.isLoading}
          errorMessage={
            listQuery.isError
              ? listQuery.error instanceof ApiError
                ? getApiErrorMessage(listQuery.error)
                : 'Could not load appointments'
              : undefined
          }
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No appointments match these filters."
        />

        {(listQuery.data?.meta.total ?? 0) > 0 && (
          <AdminPagination
            page={page}
            limit={PAGE_LIMIT}
            total={listQuery.data?.meta.total ?? 0}
            onPageChange={setPage}
          />
        )}
      </AdminCard>

      <ModalShell
        isOpen={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title="Appointment detail"
        panelClassName="max-w-2xl"
      >
        {detailQuery.isLoading ? (
          <div className="space-y-3" aria-label="Loading appointment">
            <AdminSkeleton className="h-5 w-2/3" />
            <AdminSkeleton className="h-20 w-full" />
          </div>
        ) : detailQuery.isError ? (
          <AdminInlineError
            message={
              detailQuery.error instanceof ApiError
                ? getApiErrorMessage(detailQuery.error)
                : 'Could not load this appointment'
            }
            onRetry={() => void detailQuery.refetch()}
          />
        ) : detail ? (
          <article className="space-y-6 text-left font-body text-sm text-saan-charcoal">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {detail.firstName} {detail.lastName}
                </p>
                <a
                  className="underline-offset-2 hover:underline"
                  href={`mailto:${detail.email}`}
                >
                  {detail.email}
                </a>
                <p>{detail.phone}</p>
                <p className="mt-1 text-xs text-saan-ink/50">{detail.referenceCode}</p>
              </div>
              <StatusBadge status={detail.status} />
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/50">
                  Date
                </dt>
                <dd className="mt-1">{detail.appointmentDate}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/50">
                  Time
                </dt>
                <dd className="mt-1">{detail.timeSlot}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/50">
                  Type
                </dt>
                <dd className="mt-1 capitalize">{detail.appointmentType.replace(/_/g, ' ')}</dd>
              </div>
            </dl>

            <div>
              <label
                htmlFor="appointment-admin-notes"
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/50"
              >
                Notes
              </label>
              <textarea
                id="appointment-admin-notes"
                rows={3}
                value={notesDraft}
                onChange={(event) => setNotesDraft(event.target.value)}
                className={cn(adminInputClassName, 'mt-2')}
              />
              <div className="mt-2 flex justify-end">
                <AdminButton
                  variant="secondary"
                  isLoading={notesMutation.isPending}
                  onClick={() =>
                    notesMutation.mutate({
                      id: detail.id,
                      notes: notesDraft.trim() ? notesDraft.trim() : null,
                    })
                  }
                >
                  Save notes
                </AdminButton>
              </div>
            </div>

            <div className="space-y-3 border-t border-saan-champagne/50 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/50">
                Update status
              </p>
              <div className="flex flex-wrap gap-2">
                {STATUS_ACTIONS.map((action) => (
                  <AdminButton
                    key={action.status}
                    variant="secondary"
                    disabled={
                      statusMutation.isPending || detail.status === action.status
                    }
                    onClick={() =>
                      statusMutation.mutate({
                        id: detail.id,
                        nextStatus: action.status,
                        note: statusNote.trim() || undefined,
                        reason:
                          action.status === 'cancelled' || action.status === 'rejected'
                            ? cancellationReason.trim() || undefined
                            : undefined,
                      })
                    }
                  >
                    {action.label}
                  </AdminButton>
                ))}
              </div>
              <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55">
                  Status note (optional)
                </span>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(event) => setStatusNote(event.target.value)}
                  className={adminInputClassName}
                  maxLength={1000}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55">
                  Cancellation / rejection reason
                </span>
                <input
                  type="text"
                  value={cancellationReason}
                  onChange={(event) => setCancellationReason(event.target.value)}
                  className={adminInputClassName}
                  maxLength={1000}
                />
              </label>
            </div>

            <div className="space-y-3 border-t border-saan-champagne/50 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/50">
                Reschedule
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55">
                    New date
                  </span>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(event) => setRescheduleDate(event.target.value)}
                    className={adminInputClassName}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55">
                    New time (HH:mm)
                  </span>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(event) => setRescheduleTime(event.target.value)}
                    className={adminInputClassName}
                  />
                </label>
              </div>
              <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55">
                  Reason (optional)
                </span>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(event) => setRescheduleReason(event.target.value)}
                  className={adminInputClassName}
                  maxLength={1000}
                />
              </label>
              <AdminButton
                isLoading={rescheduleMutation.isPending}
                disabled={!rescheduleDate || !rescheduleTime}
                onClick={() =>
                  rescheduleMutation.mutate({
                    id: detail.id,
                    appointmentDate: rescheduleDate,
                    timeSlot: rescheduleTime,
                    reason: rescheduleReason.trim() || undefined,
                  })
                }
              >
                Reschedule
              </AdminButton>
            </div>

            <time className="block text-xs text-saan-ink/50" dateTime={detail.createdAt}>
              Received {formatAdminDate(detail.createdAt)}
            </time>
          </article>
        ) : null}
      </ModalShell>

      <ModalShell
        isOpen={Boolean(pendingDelete)}
        onClose={() => {
          if (!deleteMutation.isPending) setPendingDelete(null);
        }}
        title="Delete appointment"
      >
        <div className="space-y-5 text-left">
          <p className="font-body text-sm text-saan-ink/70">
            Delete the appointment for{' '}
            <span className="font-medium text-saan-charcoal">
              {pendingDelete
                ? `${pendingDelete.firstName} ${pendingDelete.lastName}`
                : 'this guest'}
            </span>
            ? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <AdminButton
              variant="secondary"
              onClick={() => setPendingDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => {
                if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
              }}
            >
              Delete
            </AdminButton>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
