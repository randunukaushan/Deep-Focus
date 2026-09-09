import { RoutePlaceholder } from '@/components/route-placeholder';

export default function ForgotPasswordRoute() {
  return <RoutePlaceholder title="Forgot Password" description="Password recovery is conditional on the selected authentication flow." actions={[{ label: 'Back to Sign In', href: '/auth/sign-in', variant: 'secondary' }]} />;
}
