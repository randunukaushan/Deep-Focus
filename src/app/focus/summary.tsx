import { RoutePlaceholder } from '@/components/route-placeholder';

export default function SessionSummaryRoute() {
  return <RoutePlaceholder title="Session Summary" description="Only verified persisted session and progress data will appear in the completed feature." actions={[{ label: 'Return Home', href: '/(tabs)/index' }, { label: 'Start Another Session', href: '/focus/setup', variant: 'secondary' }]} />;
}
