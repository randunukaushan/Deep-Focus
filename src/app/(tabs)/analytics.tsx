import { RoutePlaceholder } from '@/components/route-placeholder';

export default function AnalyticsRoute() {
  return <RoutePlaceholder title="Analytics" description="Verified focus and productivity progress will appear here." actions={[{ label: 'Session History', href: '/analytics/history/index', variant: 'secondary' }]} />;
}
