import { AddressBookSection } from '@/components/account/AddressBookSection';

export const metadata = {
  title: 'Saved Addresses — SAAN',
  description: 'View the delivery addresses saved to your SAAN account.',
};

export default function AccountAddressesPage() {
  return <AddressBookSection />;
}
