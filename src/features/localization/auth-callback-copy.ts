import type { AppLocale } from '@/features/settings/settings-storage';

export type AuthCallbackCopy = {
  loadingTitle: string;
  loadingDetail: string;
  errorTitle: string;
  errorDetail: string;
  backToSignIn: string;
};

const COPY: Record<AppLocale, AuthCallbackCopy> = {
  en: {
    loadingTitle: 'Completing secure sign-in…',
    loadingDetail: 'Your account and private local data are being opened.',
    errorTitle: 'This sign-in link could not be completed.',
    errorDetail: 'The link may have expired. Request a new one and try again.',
    backToSignIn: 'Back to Sign In',
  },
  si: {
    loadingTitle: 'ආරක්ෂිත ඇතුල්වීම සම්පූර්ණ කරමින්…',
    loadingDetail: 'ඔබේ ගිණුම සහ පෞද්ගලික local දත්ත විවෘත කරමින් පවතී.',
    errorTitle: 'මෙම ඇතුල්වීමේ සබැඳිය සම්පූර්ණ කළ නොහැක.',
    errorDetail: 'සබැඳිය කල් ඉකුත් වී තිබිය හැක. අලුත් සබැඳියක් ඉල්ලා නැවත උත්සාහ කරන්න.',
    backToSignIn: 'ඇතුල් වීමට ආපසු',
  },
  ta: {
    loadingTitle: 'பாதுகாப்பான உள்நுழைவு முடிக்கப்படுகிறது…',
    loadingDetail: 'உங்கள் கணக்கும் தனிப்பட்ட உள்ளூர் தரவும் திறக்கப்படுகின்றன.',
    errorTitle: 'இந்த உள்நுழைவு இணைப்பை முடிக்க முடியவில்லை.',
    errorDetail: 'இணைப்பு காலாவதியாகியிருக்கலாம். புதிய இணைப்பைக் கோரி மீண்டும் முயற்சிக்கவும்.',
    backToSignIn: 'உள்நுழைவுக்குத் திரும்பு',
  },
};

export function getAuthCallbackCopy(locale: AppLocale): AuthCallbackCopy {
  return COPY[locale];
}
