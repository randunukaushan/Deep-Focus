import { RoutePlaceholder } from '@/components/route-placeholder';

export default function OnboardingRoute() {
  return <RoutePlaceholder title="Onboarding" description="A concise introduction to the Deep Focus experience." actions={[{ label: 'Start Personal Assessment', href: '/onboarding/assessment' }]} />;
}
