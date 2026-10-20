import { Slot } from 'expo-router';

import { SetupProvider } from '@/features/onboarding/setup-context';
import { useAuth } from '@/features/auth/auth-context';

export default function OnboardingLayout() {
  const { snapshot } = useAuth();
  return <SetupProvider key={snapshot.userId ?? 'unavailable'}><Slot /></SetupProvider>;
}
