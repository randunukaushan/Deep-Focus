import { RoutePlaceholder } from '@/components/route-placeholder';

export default function AssessmentRoute() {
  return <RoutePlaceholder title="Personal Assessment" description="The resumable assessment flow will be implemented in its approved feature phase." actions={[{ label: 'View Productivity Profile', href: '/onboarding/productivity-profile' }]} />;
}
