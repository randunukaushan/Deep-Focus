import type { AppLocale } from '@/features/settings/settings-storage';

export type BreakCopy = {
  back: string; title: string; subtitle: string; eyebrow: string; choose: string; loading: string; error: string; retry: string;
  complete: string; settle: string; durationLabel: string; minuteUnit: string; remaining: string; water: string; move: string; rest: string; resume: string; start: string; skip: string; note: string;
};

const COPY: Record<AppLocale, BreakCopy> = {
  en: { back: 'Back to focus session', title: 'Make room to recover.', subtitle: 'A break is part of the work. Step away, breathe, and return when your attention feels ready.', eyebrow: 'OPTIONAL BREAK', choose: 'Choose a gentle pause.', loading: 'Loading your saved break choice…', error: 'Your saved break choice couldn’t be read. Try again, or choose a length below; choosing here won’t overwrite your saved preference.', retry: 'Retry saved choice', complete: 'Break complete.', settle: 'Let your attention settle.', durationLabel: 'Choose a break duration', minuteUnit: 'minute break', remaining: 'remaining in break', water: 'Drink some water', move: 'Move away from the screen', rest: 'Let your eyes rest', resume: 'Resume Focus', start: 'Start', skip: 'Skip Break', note: 'Your focus session remains paused until you choose to resume.' },
  si: { back: 'අවධානයේ සැසියට ආපසු', title: 'ප්‍රතිසාධනයට ඉඩ දෙන්න.', subtitle: 'විරාමයත් වැඩේ කොටසකි. තිරයෙන් ඉවත් වී හුස්ම ගෙන, ඔබේ අවධානය සූදානම් වූ විට ආපසු එන්න.', eyebrow: 'විකල්ප විරාමය', choose: 'සන්සුන් විරාමයක් තෝරන්න.', loading: 'ඔබේ සුරකින ලද විරාම තේරීම පූරණය කරමින්…', error: 'ඔබේ සුරකින ලද විරාම තේරීම කියවිය නොහැක. නැවත උත්සාහ කරන්න, නැතිනම් පහතින් කාලයක් තෝරන්න; මෙහි තේරීමෙන් සුරකින ලද මනාපය වෙනස් නොවේ.', retry: 'සුරකින ලද තේරීම නැවත උත්සාහ කරන්න', complete: 'විරාමය සම්පූර්ණයි.', settle: 'ඔබේ අවධානය සන්සුන් වීමට ඉඩ දෙන්න.', durationLabel: 'විරාම කාලය තෝරන්න', minuteUnit: 'මිනිත්තු විරාමය', remaining: 'විරාමයේ ඉතිරි කාලය', water: 'වතුර ටිකක් බොන්න', move: 'තිරයෙන් ඉවත් වී සෙමින් ඇවිදින්න', rest: 'ඇස්වලට විවේකයක් දෙන්න', resume: 'අවධානයට ආපසු', start: 'ආරම්භ කරන්න', skip: 'විරාමය මඟහරින්න', note: 'ඔබ ආපසු යාමට තෝරන තුරු අවධානයේ සැසිය නවතා ඇත.' },
  ta: { back: 'கவன அமர்வுக்குத் திரும்பு', title: 'மீள நேரம் ஒதுக்குங்கள்.', subtitle: 'இடைவேளையும் பணியின் ஒரு பகுதி. திரையிலிருந்து விலகி, மூச்சைச் சீராக்கி, கவனம் தயாரானபோது திரும்புங்கள்.', eyebrow: 'விருப்ப இடைவேளை', choose: 'மென்மையான இடைவேளையைத் தேர்ந்தெடுக்கவும்.', loading: 'சேமித்த இடைவேளைத் தேர்வு ஏற்றப்படுகிறது…', error: 'சேமித்த இடைவேளைத் தேர்வைப் படிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது கீழே நேரத்தைத் தேர்ந்தெடுக்கவும்; இங்கே தேர்வு செய்வது சேமித்த விருப்பத்தை மாற்றாது.', retry: 'சேமித்த தேர்வை மீண்டும் முயற்சிக்கவும்', complete: 'இடைவேளை முடிந்தது.', settle: 'உங்கள் கவனம் அமைதியடையட்டும்.', durationLabel: 'இடைவேளை நேரத்தைத் தேர்ந்தெடுக்கவும்', minuteUnit: 'நிமிட இடைவேளை', remaining: 'இடைவேளையில் மீதமுள்ளது', water: 'சிறிது தண்ணீர் குடிக்கவும்', move: 'திரையிலிருந்து விலகிச் செல்லவும்', rest: 'கண்களுக்கு ஓய்வு கொடுக்கவும்', resume: 'கவனத்திற்குத் திரும்பு', start: 'தொடங்கவும்', skip: 'இடைவேளையைத் தவிர்க்கவும்', note: 'நீங்கள் தொடரத் தேர்ந்தெடுக்கும் வரை கவன அமர்வு இடைநிறுத்தப்பட்டிருக்கும்.' },
};

const RECOVERY = {
  en: {
    recoveryLoading: 'Checking your saved break…',
    recoveryError: 'Your break could not be read or saved. Retry before starting another break. Your focus session is retained.',
    recoveryRetry: 'Retry break recovery',
    clockError: 'The clock is earlier than the saved break start. Check your device time, then retry. You can return to your paused session.',
    noSession: 'There is no paused focus session for this break. Return to your focus session.',
  },
  si: {
    recoveryLoading: 'සුරකින ලද විරාමය පරීක්ෂා කරමින්…',
    recoveryError: 'විරාමය කියවීමට හෝ සුරැකීමට නොහැකි විය. අලුත් විරාමයකට පෙර නැවත උත්සාහ කරන්න. අවධානයේ සැසිය රඳවා ඇත.',
    recoveryRetry: 'විරාමය නැවත ලබාගැනීමට උත්සාහ කරන්න',
    clockError: 'උපාංගයේ වේලාව සුරකින ලද විරාම ආරම්භයට පෙර වේලාවකි. වේලාව පරීක්ෂා කර නැවත උත්සාහ කරන්න. නවතා ඇති සැසියට ආපසු යා හැක.',
    noSession: 'මෙම විරාමය සඳහා නවතා ඇති අවධානයේ සැසියක් නැත. අවධානයේ සැසියට ආපසු යන්න.',
  },
  ta: {
    recoveryLoading: 'சேமித்த இடைவேளை சரிபார்க்கப்படுகிறது…',
    recoveryError: 'இடைவேளையைப் படிக்கவோ சேமிக்கவோ முடியவில்லை. புதிய இடைவேளைக்கு முன் மீண்டும் முயற்சிக்கவும். கவன அமர்வு பாதுகாக்கப்பட்டுள்ளது.',
    recoveryRetry: 'இடைவேளை மீட்பை மீண்டும் முயற்சிக்கவும்',
    clockError: 'சாதன நேரம் சேமித்த இடைவேளை தொடங்கிய நேரத்திற்கு முன் உள்ளது. நேரத்தைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும். இடைநிறுத்திய அமர்வுக்குத் திரும்பலாம்.',
    noSession: 'இந்த இடைவேளைக்கான இடைநிறுத்திய கவன அமர்வு இல்லை. கவன அமர்வுக்குத் திரும்பவும்.',
  },
};

export function getBreakCopy(locale: AppLocale) { return { ...(COPY[locale] ?? COPY.en), ...(RECOVERY[locale] ?? RECOVERY.en) }; }
