import { RoutePlaceholder } from '@/components/route-placeholder';

export default function GoalDetailRoute() {
  return <RoutePlaceholder title="Goal Detail" description="This route is ready for validated goal data and verified progress." actions={[{ label: 'Back to Goals', href: '/goals/index', variant: 'secondary' }]} />;
}
