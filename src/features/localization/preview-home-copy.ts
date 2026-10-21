import type { AppLocale } from '@/features/settings/settings-storage';
const EN = {
  greeting: 'A fresh moment, just for you', title: 'Make room for what matters.',
  chapter: 'Your next chapter', hero: 'Small steps. Brighter days.', note: 'Progress, at your own pace.',
  next: 'Your next small step', viewPlan: 'View plan', oneThing: 'One thing at a time',
  breathingRoom: 'A little breathing room', clear: 'Your plan is clear for now.', start: 'Start focus',
  planNew: 'Plan something new', also: 'Also on your mind', add: 'Add',
  nothingElse: 'Nothing else planned. Leave room to breathe.', returnToFocus: 'Return to focus',
  encouragement: 'You don’t have to do everything. Give the next thing your attention.',
};
const COPY: Record<AppLocale, typeof EN> = {
  en: EN,
  si: {
    greeting: 'ඔබටම වෙන් වූ අලුත් මොහොතක්', title: 'වැදගත් දේ සඳහා ඉඩ සාදන්න.',
    chapter: 'ඔබේ ඊළඟ පියවර', hero: 'පොඩි පියවර. වඩා යහපත් දවස්.', note: 'ඔබේම වේගයෙන් ඉදිරියට.',
    next: 'ඔබේ ඊළඟ පොඩි පියවර', viewPlan: 'සැලැස්ම බලන්න', oneThing: 'එක වරකට එක දෙයක්',
    breathingRoom: 'පොඩි නිදහස් ඉඩක්', clear: 'දැනට ඔබේ සැලැස්ම හිස්ව ඇත.', start: 'අවධානය ආරම්භ කරන්න',
    planNew: 'අලුත් දෙයක් සැලසුම් කරන්න', also: 'තවත් සිතේ ඇති දේ', add: 'එක් කරන්න',
    nothingElse: 'වෙනත් කාර්ය සැලසුම් කර නැහැ. නිදහසටත් ඉඩ තබන්න.', returnToFocus: 'සැසියට නැවත යන්න',
    encouragement: 'හැම දෙයක්ම කළ යුතු නැහැ. ඊළඟ එක දෙයට ඔබේ අවධානය දෙන්න.',
  },
  ta: {
    greeting: 'உங்களுக்கென ஒரு புதிய தருணம்', title: 'முக்கியமானவற்றுக்கு இடமளியுங்கள்.',
    chapter: 'உங்கள் அடுத்த அத்தியாயம்', hero: 'சிறிய படிகள். ஒளிமயமான நாட்கள்.', note: 'உங்கள் வேகத்தில் முன்னேற்றம்.',
    next: 'உங்கள் அடுத்த சிறிய படி', viewPlan: 'திட்டத்தைப் பார்க்கவும்', oneThing: 'ஒரு நேரத்தில் ஒரு பணி',
    breathingRoom: 'சிறிது ஓய்வான இடம்', clear: 'இப்போதைக்கு உங்கள் திட்டம் திறந்திருக்கிறது.', start: 'கவனத்தைத் தொடங்கு',
    planNew: 'புதிதாகத் திட்டமிடு', also: 'மனதில் உள்ள மற்றவை', add: 'சேர்',
    nothingElse: 'வேறு பணிகள் திட்டமிடப்படவில்லை. ஓய்வுக்கும் இடமளியுங்கள்.', returnToFocus: 'கவனத்திற்குத் திரும்பு',
    encouragement: 'எல்லாவற்றையும் செய்ய வேண்டியதில்லை. அடுத்த ஒரு பணியில் கவனம் செலுத்துங்கள்.',
  },
};
export function getPreviewHomeCopy(locale: AppLocale) { return COPY[locale] ?? EN; }
