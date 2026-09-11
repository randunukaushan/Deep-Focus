import { RoutePlaceholder } from '@/components/route-placeholder';

export default function SignInRoute() {
  return <RoutePlaceholder title="Sign In" description="Authentication behavior will be implemented after an approved provider decision." actions={[{ label: 'Continue to Onboarding', href: '/onboarding' }, { label: 'Forgot Password', href: '/auth/forgot-password', variant: 'secondary' }, { label: 'Create Account', href: '/auth/sign-up', variant: 'ghost' }]} />;
}
