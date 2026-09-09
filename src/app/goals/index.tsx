import { RoutePlaceholder } from '@/components/route-placeholder';

export default function GoalsRoute() {
  return <RoutePlaceholder title="Goals" description="Goal creation and verified progress are not implemented in this navigation-only skeleton." actions={[{ label: 'Open Placeholder Goal', href: { pathname: '/goals/[goalId]', params: { goalId: 'placeholder-goal' } }, variant: 'secondary' }, { label: 'Back to Home', href: '/(tabs)/index', variant: 'ghost' }]} />;
}
