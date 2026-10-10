import type { AppLocale } from '@/features/settings/settings-storage';

export type AuthRuntimeCopy = {
  configurationUnavailable: string;
  accountSessionUnsafe: string;
  sessionRestoreFailed: string;
  invalidLink: string;
  incompleteLink: string;
  linkFailed: string;
  invalidDeepFocusLink: string;
};

const COPY: Record<AppLocale, AuthRuntimeCopy> = {
  en: {
    configurationUnavailable: 'Account sign-in is unavailable on this build.',
    accountSessionUnsafe: 'This account session could not be opened safely. Please sign in again.',
    sessionRestoreFailed: 'Secure sign-in could not be restored. Retry sign-in to continue.',
    invalidLink: 'The sign-in link is invalid or has expired. Request a new one and try again.',
    incompleteLink: 'The sign-in link is incomplete. Request a new one and try again.',
    linkFailed: 'The sign-in link could not be completed. Check your connection and try again.',
    invalidDeepFocusLink: 'This link is not a valid Deep Focus sign-in link.',
  },
  si: {
    configurationUnavailable: 'මෙම build එකේ ගිණුම් ඇතුල්වීම ලබාගත නොහැක.',
    accountSessionUnsafe: 'මෙම ගිණුම් session එක ආරක්ෂිතව විවෘත කළ නොහැක. නැවත ඇතුල් වන්න.',
    sessionRestoreFailed: 'ආරක්ෂිත ඇතුල්වීම නැවත ලබාගත නොහැක. ඉදිරියට යාමට නැවත උත්සාහ කරන්න.',
    invalidLink: 'ඇතුල්වීමේ සබැඳිය වැරදියි හෝ කල් ඉකුත් වී ඇත. අලුත් සබැඳියක් ඉල්ලා නැවත උත්සාහ කරන්න.',
    incompleteLink: 'ඇතුල්වීමේ සබැඳිය සම්පූර්ණ නැහැ. අලුත් සබැඳියක් ඉල්ලා නැවත උත්සාහ කරන්න.',
    linkFailed: 'ඇතුල්වීමේ සබැඳිය සම්පූර්ණ කළ නොහැක. සම්බන්ධතාව පරීක්ෂා කර නැවත උත්සාහ කරන්න.',
    invalidDeepFocusLink: 'මෙය වලංගු Deep Focus ඇතුල්වීමේ සබැඳියක් නොවේ.',
  },
  ta: {
    configurationUnavailable: 'இந்த build-இல் கணக்கு உள்நுழைவு கிடைக்கவில்லை.',
    accountSessionUnsafe: 'இந்தக் கணக்கு session-ஐ பாதுகாப்பாகத் திறக்க முடியவில்லை. மீண்டும் உள்நுழையவும்.',
    sessionRestoreFailed: 'பாதுகாப்பான உள்நுழைவை மீட்டெடுக்க முடியவில்லை. தொடர மீண்டும் முயற்சிக்கவும்.',
    invalidLink: 'உள்நுழைவு இணைப்பு தவறானது அல்லது காலாவதியானது. புதிய இணைப்பைக் கோரி மீண்டும் முயற்சிக்கவும்.',
    incompleteLink: 'உள்நுழைவு இணைப்பு முழுமையற்றது. புதிய இணைப்பைக் கோரி மீண்டும் முயற்சிக்கவும்.',
    linkFailed: 'உள்நுழைவு இணைப்பை முடிக்க முடியவில்லை. இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
    invalidDeepFocusLink: 'இது செல்லுபடியாகும் Deep Focus உள்நுழைவு இணைப்பு அல்ல.',
  },
};

export function getAuthRuntimeCopy(locale: AppLocale): AuthRuntimeCopy {
  return COPY[locale] ?? COPY.en;
}
