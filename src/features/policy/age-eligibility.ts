export type AgeBand = 'unknown' | 'adult' | 'minor_15_17' | 'minor_under_15';

export type AgeSensitiveAccess = {
  developmentAllowed: boolean;
  releaseAllowed: boolean;
  reason: 'unknown_age' | 'adult' | 'development_only' | 'legal_review_required' | 'under_minimum_age';
};

/**
 * Development approval for ages 15–17 is not release or pilot consent.
 * Unknown and under-15 users fail closed for age-sensitive features.
 */
export function decideAgeSensitiveAccess(
  ageBand: AgeBand,
  legalReviewComplete: boolean,
  pilotEnabled: boolean,
): AgeSensitiveAccess {
  if (ageBand === 'adult') return { developmentAllowed: true, releaseAllowed: true, reason: 'adult' };
  if (ageBand === 'minor_under_15') return { developmentAllowed: false, releaseAllowed: false, reason: 'under_minimum_age' };
  if (ageBand === 'minor_15_17') {
    const releaseAllowed = legalReviewComplete && pilotEnabled;
    return {
      developmentAllowed: true,
      releaseAllowed,
      reason: releaseAllowed ? 'development_only' : 'legal_review_required',
    };
  }
  return { developmentAllowed: false, releaseAllowed: false, reason: 'unknown_age' };
}
