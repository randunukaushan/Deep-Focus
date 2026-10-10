# Account Portal session recovery — 2026-10-09

Account Portal එකේ provider session කියවීම fail වුණොත් userට නැවත පරීක්ෂා
කරන්න පුළුවන් accessible retry action එකක් එක් කළා. මෙය provider sign-in,
private sync, server schema හෝ RLS implementation එකක් නොවේ.

## වෙනස්කම්

- English, Sinhala සහ Tamil copy තුළ session retry label එකක් එක් කළා.
- Error state එකේ visible alert එකට පසුව retry button එකක් පෙන්වයි.
- Retry එක page reload කිරීමෙන් provider session check එක නැවත ආරම්භ කරයි.
- Browser එකට service-role key, private token හෝ app data නිරාවරණය කරන code එකක්
  එක් කළේ නැහැ.

## සත්‍යාපනය

- Website tests: **17/17 PASS**.
- Website TypeScript: **PASS**.
- Affected website ESLint: **PASS**.
- Docs checker: **PASS**.
- Provider runtime, browser screen-reader සහ Android device පරීක්ෂණ: `NOT_RUN`.
