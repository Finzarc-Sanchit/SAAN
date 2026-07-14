import type { Metadata } from 'next';
import { AdminAccessGate } from '@/components/admin/AdminAccessGate';
import { enforceAdminServerAccess } from '@/lib/auth/admin-server-guard';

export const metadata: Metadata = {
  title: 'Admin · SAAN',
  description: 'SAAN atelier administration',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await enforceAdminServerAccess();

  return <AdminAccessGate>{children}</AdminAccessGate>;
}
