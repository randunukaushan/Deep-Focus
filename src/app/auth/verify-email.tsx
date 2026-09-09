import { RoutePlaceholder } from '@/components/route-placeholder';

export default function VerifyEmailRoute() {
  return <RoutePlaceholder title="Email Verification" description="Verification requirements remain conditional on the approved authentication policy." actions={[{ label: 'Continue to Onboarding', href: '/onboarding/index' }]} />;
}
