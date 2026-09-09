import { RoutePlaceholder } from '@/components/route-placeholder';

export default function ProductivityProfileRoute() {
  return <RoutePlaceholder title="Productivity Profile" description="A transparent summary of submitted preferences and approved recommendations." actions={[{ label: 'Continue to Home', href: '/(tabs)/index' }]} />;
}
