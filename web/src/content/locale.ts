export const SUPPORTED_LOCALES = ['en', 'si', 'ta'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_COOKIE = 'deep-focus-site-locale';

export type AccountCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  checkingSession: string;
  unavailable: string;
  sessionError: string;
  retrySession: string;
  signedInEyebrow: string;
  yourAccount: string;
  signedInDescription: string;
  signOut: string;
  signingOut: string;
  developmentAccess: string;
  resetTitle: string;
  signInTitle: string;
  credentialsBoundary: string;
  email: string;
  password: string;
  sendReset: string;
  sending: string;
  signIn: string;
  createAccount: string;
  continueGoogle: string;
  backToSignIn: string;
  forgotPassword: string;
  dataEyebrow: string;
  syncTitle: string;
  syncDescription: string;
  safetyEyebrow: string;
  safetyTitle: string;
  safetyDescription: string;
  enterEmailPassword: string;
  enterEmailPasswordForAccount: string;
  enterEmail: string;
  signedInMessage: string;
  accountCreatedMessage: string;
  checkEmailMessage: string;
  resetSentMessage: string;
  signedOutMessage: string;
  safeError: string;
};

export const accountCopy: Record<Locale, AccountCopy> = {
  en: {
    eyebrow: 'ACCOUNT PORTAL', title: 'Keep your account access clear.',
    lead: 'Use the approved development account service. This preview does not upload or display your private app data.',
    checkingSession: 'Checking your account session…', unavailable: 'Account sign-in is not configured for this local build.',
    sessionError: 'We could not verify the account session. Try again later.', retrySession: 'Try again', signedInEyebrow: 'SIGNED IN', yourAccount: 'Your account',
    signedInDescription: 'Your identity was checked by the account provider. Private task, goal, focus and resource sync is still review-pending.',
    signOut: 'Sign out', signingOut: 'Signing out…', developmentAccess: 'DEVELOPMENT ACCESS', resetTitle: 'Reset your password',
    signInTitle: 'Sign in or create an account', credentialsBoundary: 'Only the provider receives these credentials. Do not enter a password used for another service.',
    email: 'Email', password: 'Password', sendReset: 'Send reset link', sending: 'Sending…', signIn: 'Sign in', createAccount: 'Create account',
    continueGoogle: 'Continue with Google', backToSignIn: 'Back to sign in', forgotPassword: 'Forgot password?', dataEyebrow: 'YOUR DATA',
    syncTitle: 'Sync is not enabled yet', syncDescription: 'Signing in does not automatically claim device-local data. Remote schema, ownership checks, sync recovery and independent review must pass before private data appears here.',
    safetyEyebrow: 'SAFETY', safetyTitle: 'No service secret in the browser', safetyDescription: 'This portal uses only the public project key. Server secrets, provider tokens and privileged database access remain outside the browser.',
    enterEmailPassword: 'Enter your email and password.', enterEmailPasswordForAccount: 'Enter an email and password to create an account.', enterEmail: 'Enter your email address.',
    signedInMessage: 'Signed in. Account data is not synced by this preview yet.', accountCreatedMessage: 'Account created. Account data sync is still pending.', checkEmailMessage: 'Check your email to verify the account.',
    resetSentMessage: 'If an account uses this address, a reset link has been sent.', signedOutMessage: 'Signed out.', safeError: 'We could not complete that request. Check your details and try again.',
  },
  si: {
    eyebrow: 'ගිණුම් පිටුව', title: 'ඔබේ ගිණුම් ප්‍රවේශය පැහැදිලිව තබාගන්න.',
    lead: 'අනුමත සංවර්ධන ගිණුම් සේවාව භාවිත කරන්න. මෙම පෙරදසුන ඔබේ පෞද්ගලික යෙදුම් දත්ත උඩුගත කරන්නේවත් පෙන්වන්නේවත් නැත.',
    checkingSession: 'ඔබේ ගිණුම් සැසිය පරීක්ෂා කරමින්…', unavailable: 'මෙම දේශීය සංස්කරණයේ ගිණුම් ඇතුළුවීම සකසා නැත.',
    sessionError: 'ගිණුම් සැසිය තහවුරු කළ නොහැකි විය. පසුව නැවත උත්සාහ කරන්න.', retrySession: 'නැවත උත්සාහ කරන්න', signedInEyebrow: 'ඇතුළත්ව ඇත', yourAccount: 'ඔබේ ගිණුම',
    signedInDescription: 'ගිණුම් සේවා සැපයුම්කරු ඔබේ අනන්‍යතාව පරීක්ෂා කර ඇත. පෞද්ගලික කාර්ය, ඉලක්ක, අවධානය සහ සම්පත් සමමුහුර්ත කිරීම තවමත් සමාලෝචනය බලාපොරොත්තුවෙන් ඇත.',
    signOut: 'ඉවත් වන්න', signingOut: 'ඉවත් වෙමින්…', developmentAccess: 'සංවර්ධන ප්‍රවේශය', resetTitle: 'මුරපදය නැවත සකසන්න',
    signInTitle: 'ඇතුළු වන්න හෝ ගිණුමක් සාදන්න', credentialsBoundary: 'මෙම පිවිසුම් තොරතුරු ලැබෙන්නේ සේවා සැපයුම්කරුට පමණි. වෙනත් සේවාවකට භාවිත කරන මුරපදයක් ඇතුළත් නොකරන්න.',
    email: 'විද්‍යුත් තැපෑල', password: 'මුරපදය', sendReset: 'නැවත සකස් කිරීමේ සබැඳිය යවන්න', sending: 'යවමින්…', signIn: 'ඇතුළු වන්න', createAccount: 'ගිණුමක් සාදන්න',
    continueGoogle: 'Google සමඟ ඉදිරියට යන්න', backToSignIn: 'ඇතුළුවීමට ආපසු යන්න', forgotPassword: 'මුරපදය අමතකද?', dataEyebrow: 'ඔබේ දත්ත',
    syncTitle: 'සමමුහුර්ත කිරීම තවම සක්‍රිය කර නැත', syncDescription: 'ඇතුළුවීමෙන් උපාංගයේ ඇති දත්ත ස්වයංක්‍රීයව ගිණුමට එක් නොවේ. පෞද්ගලික දත්ත මෙහි පෙන්වීමට පෙර දුරස්ථ schema, හිමිකාරීත්ව පරීක්ෂා, සමමුහුර්ත ප්‍රතිසාධනය සහ ස්වාධීන සමාලෝචනය සාර්ථක විය යුතුය.',
    safetyEyebrow: 'ආරක්ෂාව', safetyTitle: 'බ්‍රව්සරයේ සේවා රහසක් නැත', safetyDescription: 'මෙම පිටුව භාවිත කරන්නේ පොදු project key එක පමණි. server secrets, සේවා ටෝකන සහ බලවත් database ප්‍රවේශය බ්‍රව්සරයෙන් පිටත තබා ඇත.',
    enterEmailPassword: 'ඔබේ විද්‍යුත් තැපෑල සහ මුරපදය ඇතුළත් කරන්න.', enterEmailPasswordForAccount: 'ගිණුමක් සෑදීමට විද්‍යුත් තැපෑලක් සහ මුරපදයක් ඇතුළත් කරන්න.', enterEmail: 'ඔබේ විද්‍යුත් තැපැල් ලිපිනය ඇතුළත් කරන්න.',
    signedInMessage: 'ඇතුළු විය. මෙම පෙරදසුනෙන් ගිණුම් දත්ත තවම සමමුහුර්ත නොවේ.', accountCreatedMessage: 'ගිණුම සෑදී ඇත. ගිණුම් දත්ත සමමුහුර්ත කිරීම තවමත් බලාපොරොත්තුවෙන් ඇත.', checkEmailMessage: 'ගිණුම තහවුරු කිරීමට ඔබේ විද්‍යුත් තැපෑල පරීක්ෂා කරන්න.',
    resetSentMessage: 'මෙම ලිපිනය භාවිත කරන ගිණුමක් තිබේ නම්, නැවත සකස් කිරීමේ සබැඳියක් යවා ඇත.', signedOutMessage: 'ඉවත් විය.', safeError: 'එම ඉල්ලීම සම්පූර්ණ කළ නොහැකි විය. ඔබේ තොරතුරු පරීක්ෂා කර නැවත උත්සාහ කරන්න.',
  },
  ta: {
    eyebrow: 'கணக்கு பகுதி', title: 'உங்கள் கணக்கு அணுகலைத் தெளிவாக வைத்திருங்கள்.',
    lead: 'அங்கீகரிக்கப்பட்ட மேம்பாட்டு கணக்கு சேவையைப் பயன்படுத்துங்கள். இந்த முன்னோட்டம் உங்கள் தனிப்பட்ட பயன்பாட்டுத் தரவைப் பதிவேற்றவோ காட்டவோ இல்லை.',
    checkingSession: 'உங்கள் கணக்கு அமர்வு சரிபார்க்கப்படுகிறது…', unavailable: 'இந்த உள்ளூர் உருவாக்கத்தில் கணக்கு உள்நுழைவு அமைக்கப்படவில்லை.',
    sessionError: 'கணக்கு அமர்வைச் சரிபார்க்க முடியவில்லை. பின்னர் மீண்டும் முயற்சிக்கவும்.', retrySession: 'மீண்டும் முயற்சிக்கவும்', signedInEyebrow: 'உள்நுழைந்துள்ளீர்கள்', yourAccount: 'உங்கள் கணக்கு',
    signedInDescription: 'கணக்கு வழங்குநர் உங்கள் அடையாளத்தைச் சரிபார்த்துள்ளார். தனிப்பட்ட பணி, இலக்கு, கவனம் மற்றும் வள ஒத்திசைவு இன்னும் மதிப்பாய்வு நிலுவையில் உள்ளது.',
    signOut: 'வெளியேறு', signingOut: 'வெளியேறுகிறது…', developmentAccess: 'மேம்பாட்டு அணுகல்', resetTitle: 'கடவுச்சொல்லை மீட்டமைக்கவும்',
    signInTitle: 'உள்நுழையவும் அல்லது கணக்கை உருவாக்கவும்', credentialsBoundary: 'இந்த உள்நுழைவு விவரங்களைப் பெறுவது வழங்குநர் மட்டுமே. வேறு சேவையில் பயன்படுத்தும் கடவுச்சொல்லை உள்ளிட வேண்டாம்.',
    email: 'மின்னஞ்சல்', password: 'கடவுச்சொல்', sendReset: 'மீட்டமைப்பு இணைப்பை அனுப்பவும்', sending: 'அனுப்புகிறது…', signIn: 'உள்நுழை', createAccount: 'கணக்கை உருவாக்கு',
    continueGoogle: 'Google மூலம் தொடரவும்', backToSignIn: 'உள்நுழைவுக்குத் திரும்பவும்', forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?', dataEyebrow: 'உங்கள் தரவு',
    syncTitle: 'ஒத்திசைவு இன்னும் இயக்கப்படவில்லை', syncDescription: 'உள்நுழைவதால் சாதனத்தில் உள்ள தரவு தானாகக் கணக்குடன் இணைக்கப்படாது. தனிப்பட்ட தரவு இங்கே தோன்றுவதற்கு முன் தொலைநிலை schema, உரிமைச் சரிபார்ப்பு, ஒத்திசைவு மீட்பு மற்றும் சுயாதீன மதிப்பாய்வு வெற்றியடைய வேண்டும்.',
    safetyEyebrow: 'பாதுகாப்பு', safetyTitle: 'உலாவியில் சேவை ரகசியம் இல்லை', safetyDescription: 'இந்தப் பகுதி பொது project key-ஐ மட்டுமே பயன்படுத்துகிறது. சேவையக ரகசியங்கள், வழங்குநர் டோக்கன்கள் மற்றும் சிறப்பு database அணுகல் உலாவிக்கு வெளியே வைக்கப்பட்டுள்ளன.',
    enterEmailPassword: 'உங்கள் மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.', enterEmailPasswordForAccount: 'கணக்கை உருவாக்க மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.', enterEmail: 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்.',
    signedInMessage: 'உள்நுழைந்துவிட்டீர்கள். இந்த முன்னோட்டத்தில் கணக்கு தரவு இன்னும் ஒத்திசைக்கப்படவில்லை.', accountCreatedMessage: 'கணக்கு உருவாக்கப்பட்டது. கணக்கு தரவு ஒத்திசைவு இன்னும் நிலுவையில் உள்ளது.', checkEmailMessage: 'கணக்கைச் சரிபார்க்க உங்கள் மின்னஞ்சலைப் பாருங்கள்.',
    resetSentMessage: 'இந்த முகவரியைப் பயன்படுத்தும் கணக்கு இருந்தால், மீட்டமைப்பு இணைப்பு அனுப்பப்பட்டுள்ளது.', signedOutMessage: 'வெளியேறிவிட்டீர்கள்.', safeError: 'அந்தக் கோரிக்கையை முடிக்க முடியவில்லை. உங்கள் விவரங்களைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
  },
};

export const sharedCopy: Record<Locale, {
  skip: string;
  status: string;
  language: string;
  applyLanguage: string;
  navLabel: string;
  footerLabel: string;
  menu: string;
  account: string;
  navLinks: readonly [string, string, string, string, string];
  footerLinks: readonly [string, string, string, string, string, string];
  footerTagline: string;
  footerNote: string;
  pageEnglishNotice: string;
}> = {
  en: {
    skip: 'Skip to content',
    status: 'Product development preview · No sign-up or purchase',
    language: 'Website language',
    applyLanguage: 'Apply language',
    navLabel: 'Main navigation',
    footerLabel: 'Footer navigation',
    menu: 'Menu',
    account: 'Account',
    navLinks: ['Features', 'For yourself', 'For education', 'Roadmap', 'Plans'],
    footerLinks: ['Updates', 'Help', 'Accessibility', 'Privacy', 'Terms', 'Contact'],
    footerTagline: 'Focus on What Matters.',
    footerNote: 'Development preview. Product, availability and policy details are not final.',
    pageEnglishNotice: '',
  },
  si: {
    skip: 'අන්තර්ගතයට යන්න',
    status: 'නිෂ්පාදනය තවම සංවර්ධනය වෙමින් පවතී · ලියාපදිංචි වීමක් හෝ මිලදී ගැනීමක් නැත',
    language: 'වෙබ් අඩවියේ භාෂාව',
    applyLanguage: 'භාෂාව යොදන්න',
    navLabel: 'ප්‍රධාන මෙනුව',
    footerLabel: 'පහළ මෙනුව',
    menu: 'මෙනුව',
    account: 'ගිණුම',
    navLinks: ['විශේෂාංග', 'ඔබ වෙනුවෙන්', 'අධ්‍යාපනය සඳහා', 'ඉදිරි සැලැස්ම', 'සැලසුම්'],
    footerLinks: ['යාවත්කාලීන', 'උදව්', 'ප්‍රවේශ පහසුකම්', 'පෞද්ගලිකත්වය', 'නියමයන්', 'සම්බන්ධ වන්න'],
    footerTagline: 'වැදගත් දේට අවධානය දෙන්න.',
    footerNote: 'සංවර්ධන පෙරදසුනකි. නිෂ්පාදනය, ලබාගත හැකි බව සහ ප්‍රතිපත්ති පිළිබඳ තොරතුරු අවසන් නැත.',
    pageEnglishNotice: 'මෙම පිටුවේ අන්තර්ගතය දැනට ඉංග්‍රීසියෙන් පමණයි.',
  },
  ta: {
    skip: 'உள்ளடக்கத்திற்குச் செல்லவும்',
    status: 'தயாரிப்பு இன்னும் உருவாக்கத்தில் உள்ளது · பதிவு அல்லது கொள்முதல் இல்லை',
    language: 'இணையதள மொழி',
    applyLanguage: 'மொழியைப் பயன்படுத்து',
    navLabel: 'முதன்மை வழிசெலுத்தல்',
    footerLabel: 'அடிக்குறிப்பு வழிசெலுத்தல்',
    menu: 'பட்டியல்',
    account: 'கணக்கு',
    navLinks: ['அம்சங்கள்', 'உங்களுக்காக', 'கல்விக்காக', 'வழித்திட்டம்', 'திட்டங்கள்'],
    footerLinks: ['புதுப்பிப்புகள்', 'உதவி', 'அணுகல்தன்மை', 'தனியுரிமை', 'விதிமுறைகள்', 'தொடர்பு'],
    footerTagline: 'முக்கியமானவற்றில் கவனம் செலுத்துங்கள்.',
    footerNote: 'உருவாக்கப் பணியின் முன்னோட்டம். தயாரிப்பு, கிடைக்கும் தன்மை மற்றும் கொள்கை விவரங்கள் இறுதியானவை அல்ல.',
    pageEnglishNotice: 'இந்தப் பக்கத்தின் உள்ளடக்கம் தற்போது ஆங்கிலத்தில் மட்டுமே உள்ளது.',
  },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : 'en';
}

export function safeLocalReturnPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/';
  if (/[\u0000-\u001f\u007f]/.test(value)) return '/';
  try {
    const parsed = new URL(value, 'https://deep-focus.invalid');
    return parsed.origin === 'https://deep-focus.invalid' ? `${parsed.pathname}${parsed.search}${parsed.hash}` : '/';
  } catch {
    return '/';
  }
}
