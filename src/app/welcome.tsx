import { RoutePlaceholder } from '@/components/route-placeholder';

export default function WelcomeRoute() {
  return <RoutePlaceholder title="Welcome" description="A calm introduction to Deep Focus." actions={[{ label: 'Get Started', href: '/onboarding/index' }, { label: 'Sign In', href: '/auth/sign-in', variant: 'secondary' }]} />;
}
