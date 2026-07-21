import { AppointmentBookingSection } from '@/components/appointment/AppointmentSections';
import { APPOINTMENT_COPY } from '@/lib/site-content';

export const metadata = {
  title: 'Book Appointment — SAAN',
  description: APPOINTMENT_COPY.intro.description,
};

export default function AppointmentPage() {
  return (
    <main>
      <AppointmentBookingSection />
    </main>
  );
}
