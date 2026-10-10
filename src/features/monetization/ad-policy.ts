export type AdEligibility = 'adult_eligible' | 'minor' | 'unknown';
export type AdSurface = 'home' | 'plan' | 'progress' | 'resources' | 'focus' | 'recovery' | 'settings' | 'auth';

export type AdPolicyContext = {
  surface: AdSurface;
  eligibility: AdEligibility;
  consent: 'granted' | 'denied' | 'unknown';
  isActiveFocus: boolean;
  isTrueZenBreak: boolean;
};

/** Policy only: no advertising SDK, targeting or network request is performed here. */
export function mayRenderAd(context: AdPolicyContext): boolean {
  if (context.consent !== 'granted' || context.eligibility !== 'adult_eligible') return false;
  if (context.isActiveFocus || context.isTrueZenBreak) return false;
  if (context.surface === 'focus' || context.surface === 'recovery' || context.surface === 'auth' || context.surface === 'settings') return false;
  return true;
}
