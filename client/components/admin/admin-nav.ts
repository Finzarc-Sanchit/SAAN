import {
  BookOpen,
  Calendar,
  Clock,
  CreditCard,
  Images,
  Mail,
  LayoutDashboard,
  Megaphone,
  Package,
  Ruler,
  ShoppingBag,
  Tags,
  UserRoundPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: 'menu',
    label: 'Menu',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: Tags },
      { label: 'Collections', href: '/admin/collections', icon: Images },
      { label: 'Sizes', href: '/admin/sizes', icon: Ruler },
      { label: 'Campaigns', href: '/admin/campaigns', icon: Megaphone },
      { label: 'Journal', href: '/admin/journal', icon: BookOpen },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Payments', href: '/admin/payments', icon: CreditCard },
      { label: 'Customers', href: '/admin/customers', icon: Users },
      { label: 'Contacts', href: '/admin/contacts', icon: Mail },
      { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
      { label: 'Appointment Settings', href: '/admin/appointment-settings', icon: Clock },
      { label: 'Newsletter', href: '/admin/newsletter', icon: UserRoundPlus },
    ],
  },
];
