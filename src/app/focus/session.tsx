import { useLocalSearchParams } from 'expo-router';
import { RoutePlaceholder } from '@/components/route-placeholder';

export default function ActiveSessionRoute() {
  const { durationMinutes, taskName } = useLocalSearchParams<{ durationMinutes?: string; taskName?: string }>();
  const duration = durationMinutes ? `${durationMinutes} minutes` : 'configured duration';
  const task = taskName ? ` for “${taskName}”` : '';
  return <RoutePlaceholder title="Active Focus Session" description={`Session started${task} with ${duration}. Timestamp-based timing, pause, resume, completion, and cancellation will be implemented next.`} actions={[{ label: 'Complete Placeholder Session', href: '/focus/break' }, { label: 'End Without Break', href: '/focus/summary', variant: 'secondary' }, { label: 'Back to Setup', href: '/focus/setup', variant: 'ghost' }]} />;
}
