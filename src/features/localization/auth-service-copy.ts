import type { AppLocale } from '@/features/settings/settings-storage';

export type AuthServiceCopy = {
  invalidCredentials: string;
  weakPassword: string;
  rateLimit: string;
  secureStorage: string;
  generic: string;
  emptyPassword: string;
  emptySignUpPassword: string;
  emptyNewPassword: string;
  noSessionVerify: string;
  googleNotConfigured: string;
  incompleteResponse: string;
  noSession: string;
  appleUnavailable: string;
  appleNoToken: string;
};

const COPY: Record<AppLocale, AuthServiceCopy> = {
  en: {
    invalidCredentials: 'Email or password is incorrect, or email verification is still needed.',
    weakPassword: 'Choose a stronger password and try again.',
    rateLimit: 'Please wait a little before trying again.',
    secureStorage: 'Secure sign-in could not be saved on this device. Your account was not opened.',
    generic: 'We could not complete sign-in. Check your connection and try again.',
    emptyPassword: 'Enter your password.',
    emptySignUpPassword: 'Enter a password.',
    emptyNewPassword: 'Enter a new password.',
    noSessionVerify: 'Sign-in did not create a session. Try again or verify your email.',
    googleNotConfigured: 'Google sign-in is not configured for this app yet.',
    incompleteResponse: 'The sign-in response was incomplete. Please try again.',
    noSession: 'Sign-in did not create a session. Try again.',
    appleUnavailable: 'Apple sign-in is available on supported iOS devices.',
    appleNoToken: 'Apple did not return a sign-in token. Please try again.',
  },
  si: {
    invalidCredentials: 'විද්‍යුත් තැපෑල හෝ මුරපදය වැරදියි, නැතහොත් විද්‍යුත් තැපෑල තවම තහවුරු කර නැත.',
    weakPassword: 'වඩා ශක්තිමත් මුරපදයක් තෝරා නැවත උත්සාහ කරන්න.',
    rateLimit: 'නැවත උත්සාහ කිරීමට මඳ වේලාවක් රැඳී සිටින්න.',
    secureStorage: 'ආරක්ෂිත ඇතුල්වීම මෙම උපාංගයේ සුරැකිය නොහැකි විය. ඔබේ ගිණුම විවෘත කර නැත.',
    generic: 'ඇතුල්වීම සම්පූර්ණ කළ නොහැකි විය. ඔබේ සම්බන්ධතාව පරීක්ෂා කර නැවත උත්සාහ කරන්න.',
    emptyPassword: 'ඔබේ මුරපදය ඇතුළත් කරන්න.',
    emptySignUpPassword: 'මුරපදයක් ඇතුළත් කරන්න.',
    emptyNewPassword: 'නව මුරපදයක් ඇතුළත් කරන්න.',
    noSessionVerify: 'ඇතුල්වීමේ සැසියක් සෑදුණේ නැත. නැවත උත්සාහ කරන්න හෝ ඔබේ විද්‍යුත් තැපෑල තහවුරු කරන්න.',
    googleNotConfigured: 'Google ඇතුල්වීම මෙම යෙදුම සඳහා තවම සකසා නැත.',
    incompleteResponse: 'ඇතුල්වීමේ ප්‍රතිචාරය සම්පූර්ණ නැත. නැවත උත්සාහ කරන්න.',
    noSession: 'ඇතුල්වීමේ සැසියක් සෑදුණේ නැත. නැවත උත්සාහ කරන්න.',
    appleUnavailable: 'Apple ඇතුල්වීම සහාය දක්වන iOS උපාංගවල පමණක් ලබා ගත හැක.',
    appleNoToken: 'Apple ඇතුල්වීමේ ටෝකනයක් ලබා දුන්නේ නැත. නැවත උත්සාහ කරන්න.',
  },
  ta: {
    invalidCredentials: 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறாக உள்ளது; அல்லது மின்னஞ்சல் இன்னும் சரிபார்க்கப்படவில்லை.',
    weakPassword: 'வலுவான கடவுச்சொல்லைத் தேர்ந்தெடுத்து மீண்டும் முயற்சிக்கவும்.',
    rateLimit: 'மீண்டும் முயற்சிக்கும் முன் சிறிது நேரம் காத்திருக்கவும்.',
    secureStorage: 'பாதுகாப்பான உள்நுழைவை இந்தச் சாதனத்தில் சேமிக்க முடியவில்லை. உங்கள் கணக்கு திறக்கப்படவில்லை.',
    generic: 'உள்நுழைவை முடிக்க முடியவில்லை. உங்கள் இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
    emptyPassword: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்.',
    emptySignUpPassword: 'கடவுச்சொல்லை உள்ளிடவும்.',
    emptyNewPassword: 'புதிய கடவுச்சொல்லை உள்ளிடவும்.',
    noSessionVerify: 'உள்நுழைவு அமர்வு உருவாக்கப்படவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும்.',
    googleNotConfigured: 'இந்தச் செயலிக்கான Google உள்நுழைவு இன்னும் அமைக்கப்படவில்லை.',
    incompleteResponse: 'உள்நுழைவு பதில் முழுமையாக இல்லை. மீண்டும் முயற்சிக்கவும்.',
    noSession: 'உள்நுழைவு அமர்வு உருவாக்கப்படவில்லை. மீண்டும் முயற்சிக்கவும்.',
    appleUnavailable: 'ஆதரிக்கப்படும் iOS சாதனங்களில் மட்டுமே Apple உள்நுழைவு கிடைக்கும்.',
    appleNoToken: 'Apple உள்நுழைவு டோக்கனை வழங்கவில்லை. மீண்டும் முயற்சிக்கவும்.',
  },
};

export function getAuthServiceCopy(locale: AppLocale): AuthServiceCopy {
  return COPY[locale] ?? COPY.en;
}
