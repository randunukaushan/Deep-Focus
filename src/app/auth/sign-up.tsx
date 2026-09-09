import { RoutePlaceholder } from '@/components/route-placeholder';

export default function SignUpRoute() {
  return <RoutePlaceholder title="Sign Up" description="This route reserves the approved account-creation experience without implementing production authentication." actions={[{ label: 'Continue', href: '/auth/verify-email' }, { label: 'Sign In', href: '/auth/sign-in', variant: 'secondary' }]} />;
}
