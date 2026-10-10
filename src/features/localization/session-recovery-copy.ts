import type { AppLocale } from '@/features/settings/settings-storage';

export type SessionRecoveryCopy = {
  checkingTitle: string; checkingDetail: string; errorTitle: string; errorDetail: string; retry: string;
  home: string; backHome: string; readyTitle: string; readyDetail: string; safeTitle: string; safeDetail: string;
  newSession: string;
};

const COPY: Record<AppLocale, SessionRecoveryCopy> = {
  en: { checkingTitle: 'Checking your focus session.', checkingDetail: 'Restoring safely if your session was interrupted.', errorTitle: 'We couldn’t check your saved session.', errorDetail: 'Your saved data hasn’t been changed. Try again, or return home and check later.', retry: 'Try again', home: 'Home', backHome: 'Back to home', readyTitle: 'You are ready when you are.', readyDetail: 'There is no interrupted session waiting to be recovered. You can start fresh, without losing the progress already saved on this device.', safeTitle: 'Your progress is safe.', safeDetail: 'Deep Focus checks for an active session before showing this screen. If one is found, it opens automatically so you can continue.', newSession: 'Start a New Session' },
  si: { checkingTitle: 'ඔබේ අවධානම් සැසිය පරීක්ෂා කරමින්.', checkingDetail: 'ඔබේ සැසියට බාධාවක් වූවා නම් එය ආරක්ෂිතව ප්‍රතිසාධනය කරමින්.', errorTitle: 'ඔබේ සුරකින ලද සැසිය පරීක්ෂා කළ නොහැක.', errorDetail: 'ඔබේ සුරකින ලද දත්ත වෙනස් කර නැත. නැවත උත්සාහ කරන්න, නැතිනම් මුල් පිටුවට ගොස් පසුව පරීක්ෂා කරන්න.', retry: 'නැවත උත්සාහ කරන්න', home: 'මුල් පිටුව', backHome: 'මුල් පිටුවට ආපසු', readyTitle: 'ඔබ සූදානම් වූ විට ආරම්භ කරන්න.', readyDetail: 'ප්‍රතිසාධනය කිරීමට බාධා වූ සැසියක් නැත. මෙම උපාංගයේ දැනටමත් සුරකින ලද ප්‍රගතිය නැති නොකර අලුතින් ආරම්භ කළ හැක.', safeTitle: 'ඔබේ ප්‍රගතිය ආරක්ෂිතයි.', safeDetail: 'මෙම තිරය පෙන්වීමට පෙර Deep Focus සක්‍රිය සැසියක් පරීක්ෂා කරයි. එකක් හමු වුවහොත් ඔබට දිගටම කරගෙන යාමට එය ස්වයංක්‍රීයව විවෘත වේ.', newSession: 'නව සැසියක් ආරම්භ කරන්න' },
  ta: { checkingTitle: 'உங்கள் கவன அமர்வு சரிபார்க்கப்படுகிறது.', checkingDetail: 'உங்கள் அமர்வு தடைப்பட்டிருந்தால் பாதுகாப்பாக மீட்டெடுக்கப்படுகிறது.', errorTitle: 'சேமித்த அமர்வைச் சரிபார்க்க முடியவில்லை.', errorDetail: 'சேமித்த தரவு மாற்றப்படவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது முகப்புக்குத் திரும்பி பின்னர் பார்க்கவும்.', retry: 'மீண்டும் முயற்சிக்கவும்', home: 'முகப்பு', backHome: 'முகப்புக்குத் திரும்பு', readyTitle: 'நீங்கள் தயாரானபோது தொடங்குங்கள்.', readyDetail: 'மீட்டெடுக்க வேண்டிய தடைப்பட்ட அமர்வு இல்லை. இந்தச் சாதனத்தில் ஏற்கனவே சேமித்த முன்னேற்றத்தை இழக்காமல் புதிதாகத் தொடங்கலாம்.', safeTitle: 'உங்கள் முன்னேற்றம் பாதுகாப்பாக உள்ளது.', safeDetail: 'இந்தத் திரையைக் காட்டுவதற்கு முன் Deep Focus செயலில் உள்ள அமர்வைச் சரிபார்க்கிறது. ஒன்று இருந்தால் தொடர்வதற்காக அது தானாகத் திறக்கும்.', newSession: 'புதிய அமர்வைத் தொடங்கவும்' },
};

export function getSessionRecoveryCopy(locale: AppLocale): SessionRecoveryCopy { return COPY[locale] ?? COPY.en; }
