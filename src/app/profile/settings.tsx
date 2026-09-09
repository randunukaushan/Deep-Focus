import { RoutePlaceholder } from '@/components/route-placeholder';

export default function SettingsRoute() {
  return <RoutePlaceholder title="Settings" description="Only preferences backed by implemented V1 behavior will be enabled here." actions={[{ label: 'Back to Profile', href: '/profile', variant: 'secondary' }]} />;
}
