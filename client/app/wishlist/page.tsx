import type { Metadata } from 'next';
import { WishlistPage } from '@/components/wishlist/WishlistPage';

export const metadata: Metadata = {
  title: 'Wishlist — SAAN',
  description: 'Pieces you have saved — return when you are ready.',
};

export default function WishlistRoutePage() {
  return <WishlistPage />;
}
