import { RoutePlaceholder } from '@/components/route-placeholder';

export default function TaskDetailRoute() {
  return <RoutePlaceholder title="Task Detail" description="This route is ready for a validated user-owned task identifier and repository-backed data." actions={[{ label: 'Configure Focus Session', href: '/focus/setup' }, { label: 'Back to Tasks', href: '/tasks/index', variant: 'secondary' }]} />;
}
