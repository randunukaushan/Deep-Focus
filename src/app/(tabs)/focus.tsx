import { RoutePlaceholder } from '@/components/route-placeholder';

export default function FocusRoute() {
  return <RoutePlaceholder title="Focus" description="Start a new focus session or return to a recoverable session." actions={[{ label: 'Configure Focus Session', href: '/focus/setup' }, { label: 'Session Recovery', href: '/focus/recovery', variant: 'secondary' }]} />;
}
