'use client';

import { GeneralInformationSection } from '@/components/account/GeneralInformationSection';
import { useAuth } from '@/components/providers/AuthProvider';

export function AccountProfileDetailsPage() {
  const { user, updateProfile } = useAuth();

  if (!user) return null;

  return <GeneralInformationSection user={user} updateProfile={updateProfile} />;
}
