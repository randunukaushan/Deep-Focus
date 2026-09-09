import { RoutePlaceholder } from '@/components/route-placeholder';

export default function ProfileRoute() {
  return <RoutePlaceholder title="Profile" description="Manage profile information and open supported preferences." actions={[{ label: 'Settings', href: '/profile/settings' }]} />;
}
