import NotFound from '@/app/not-found';

/** Segment-level 404 so unauthorized admin access is not wrapped in the admin shell. */
export default function AdminSegmentNotFound() {
  return <NotFound />;
}
