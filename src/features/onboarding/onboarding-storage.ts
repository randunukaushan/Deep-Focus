import { Platform } from 'react-native';

import {
  loadOnboardingState as loadLocalOnboardingState,
  saveOnboardingState as saveLocalOnboardingState,
  type OnboardingState,
  type OnboardingStatus,
  type OnboardingStep,
} from '@/features/storage/local-database';

export type { OnboardingState, OnboardingStatus, OnboardingStep };

function assertNativeStorage(): void {
  if (Platform.OS === 'web') throw new Error('ONBOARDING_STORAGE_UNAVAILABLE');
}

export async function loadOnboardingState(): Promise<OnboardingState> {
  assertNativeStorage();
  return loadLocalOnboardingState();
}

export async function saveOnboardingState(state: OnboardingState): Promise<void> {
  assertNativeStorage();
  return saveLocalOnboardingState(state);
}
