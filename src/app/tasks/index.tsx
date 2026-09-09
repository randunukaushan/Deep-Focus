import { RoutePlaceholder } from '@/components/route-placeholder';

export default function TasksRoute() {
  return <RoutePlaceholder title="Tasks" description="Task creation and persisted task data are not implemented in this navigation-only skeleton." actions={[{ label: 'Open Placeholder Task', href: { pathname: '/tasks/[taskId]', params: { taskId: 'placeholder-task' } }, variant: 'secondary' }, { label: 'Back to Home', href: '/(tabs)/index', variant: 'ghost' }]} />;
}
