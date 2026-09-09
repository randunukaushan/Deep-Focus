import { RoutePlaceholder } from '@/components/route-placeholder';

export default function SessionHistoryRoute() {
  return <RoutePlaceholder title="Session History" description="Persisted focus sessions will appear here after the session data layer is implemented." actions={[{ label: 'Open Placeholder Session', href: { pathname: '/analytics/history/[sessionId]', params: { sessionId: 'placeholder-session' } }, variant: 'secondary' }, { label: 'Back to Analytics', href: '/analytics', variant: 'ghost' }]} />;
}
