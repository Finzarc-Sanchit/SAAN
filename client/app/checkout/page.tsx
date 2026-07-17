import { redirect } from 'next/navigation';

export default function CheckoutRoutePage() {
  redirect('/checkout/bag');
}
