import type { AppLocale } from '@/features/settings/settings-storage';
import type { SetupField, SetupQuestionId } from './setup-definition';

type QuestionCopy = { title: string; detail: string; options: Record<string, string> };
type Copy = {
  welcome: string; intro: string; language: string; languageHint: string;
  next: string; review: string; back: string; skip: string; skipQuestion: string;
  privacy: string; step: string; loading: string; saving: string; retry: string;
  failed: string; conflict: string; keep: string; reviewTitle: string; reviewDetail: string;
  current: string; proposed: string; apply: string; unchanged: string; continue: string;
  applied: string; reviewAgain: string; redo: string; navError: string;
  fields: Record<SetupField, string>; questions: Record<SetupQuestionId, QuestionCopy>;
};
const en: Copy = {
  welcome: 'A calmer start.', intro: 'Make this space work for you. Choose your language, then four small preferences. You can change them later.',
  language: 'Which language feels right?', languageHint: 'This changes the app interface only.',
  next: 'Continue', review: 'Review my choices', back: 'Back', skip: 'Set up later · keep my draft', skipQuestion: 'Skip this question',
  privacy: 'Saved for this account on this device. No AI, permissions or sharing. Your existing work stays unchanged.',
  step: 'Step {current} of 5', loading: 'Loading your saved choices…', saving: 'Saving…', retry: 'Retry',
  failed: 'Could not save or load your choices. Your current settings have not been replaced. Retry when ready.',
  conflict: 'Something changed since this review. Reload the saved choices and review again; no changes were applied.',
  keep: 'Keep my current setting', reviewTitle: 'A little more you.',
  reviewDetail: 'Choose the changes you want to apply. Nothing is selected for replacement automatically. Time choices affect future sessions, not a running session.',
  current: 'Current', proposed: 'Proposed', apply: 'Apply selected changes', unchanged: 'No settings need to change.',
  continue: 'Continue without changes', applied: 'Your choices are saved.', reviewAgain: 'Refresh review', redo: 'Personalize again', navError: 'Could not continue. Your choices are kept. Try again.',
  fields: { defaultFocusDurationMinutes: 'Focus duration', defaultBreakDurationMinutes: 'Break duration', appearance: 'Appearance', reduceMotion: 'Motion' },
  questions: {
    focus_duration: { title: 'How long would you like to focus?', detail: 'A starting point, not a target. You can choose again before each session.', options: { '25': '25 minutes · a small start', '45': '45 minutes · a steady block', '60': '60 minutes · more space' } },
    break_duration: { title: 'Make room to reset.', detail: 'Choose the starting length for your breaks. Taking a break is always your choice.', options: { '5': '5 minutes · a brief pause', '10': '10 minutes · a little breathing room', '15': '15 minutes · an unhurried reset' } },
    appearance: { title: 'What feels comfortable to look at?', detail: 'Choose the app’s appearance. It stays editable in Profile.', options: { system: 'Follow my device', light: 'Light · soft and open', dark: 'Dark · quiet and grounded' } },
    motion: { title: 'Keep things still, or gently moving?', detail: 'Your device’s Reduce Motion setting is always respected.', options: { system: 'Follow my device', reduced: 'Reduce decorative movement' } },
  },
};
const si: Copy = {
  welcome: 'සන්සුන් ආරම්භයක්.', intro: 'මේ ඉඩ ඔබට ගැළපෙන ලෙස සකසාගමු. මුලින් භාෂාවත්, ඉන්පසු සරල මනාප හතරකුත් තෝරන්න. පසුව වෙනස් කළ හැකියි.',
  language: 'ඔබ කැමති භාෂාව කුමක්ද?', languageHint: 'මෙයින් වෙනස් වන්නේ ඇප් එකේ භාෂාව පමණයි.',
  next: 'ඉදිරියට', review: 'තේරීම් සමාලෝචනය කරන්න', back: 'ආපසු', skip: 'පසුව සකසන්න · පිළිතුරු තබාගන්න', skipQuestion: 'මේ ප්‍රශ්නය මඟහරින්න',
  privacy: 'මේ ගිණුමට මේ උපාංගයේ පමණක් සුරකිනවා. AI, අවසර හෝ බෙදාගැනීමක් නැහැ. දැනට ඇති වැඩ වෙනස් නොවේ.',
  step: 'පියවර {current} / 5', loading: 'සුරැකි තේරීම් ලබාගන්නවා…', saving: 'සුරකිනවා…', retry: 'නැවත උත්සාහ කරන්න',
  failed: 'තේරීම් සුරැකීමට හෝ ලබාගැනීමට බැරි වුණා. දැනට ඇති සැකසුම් වෙනුවට වෙනත් අගයන් යොදා නැහැ. නැවත උත්සාහ කරන්න.',
  conflict: 'සමාලෝචනයෙන් පසු දත්ත වෙනස් වී තිබෙනවා. සුරැකි තේරීම් නැවත ලබාගෙන සමාලෝචනය කරන්න. වෙනස්කම් යෙදුවේ නැහැ.',
  keep: 'දැනට ඇති සැකසුම තබාගන්න', reviewTitle: 'ඔබට ගැළපෙන ආරම්භයක්.',
  reviewDetail: 'යෙදීමට අවශ්‍ය වෙනස්කම් තෝරන්න. කිසිවක් ඉබේ තෝරන්නේ නැහැ. කාල තේරීම් ඊළඟ සැසිවලටයි; දැන් ක්‍රියාත්මක සැසියට නොවෙයි.',
  current: 'දැනට', proposed: 'යෝජිත', apply: 'තෝරාගත් වෙනස්කම් යොදන්න', unchanged: 'සැකසුම් වෙනස් කිරීමට අවශ්‍ය නැහැ.',
  continue: 'වෙනස් නොකර ඉදිරියට', applied: 'ඔබේ තේරීම් සුරැකුණා.', reviewAgain: 'නැවත සමාලෝචනය කරන්න', redo: 'නැවත ඔබට ගළපාගන්න', navError: 'ඉදිරියට යන්න බැරි වුණා. තේරීම් තවම තිබෙනවා. නැවත උත්සාහ කරන්න.',
  fields: { defaultFocusDurationMinutes: 'වැඩ කරන කාලය', defaultBreakDurationMinutes: 'විවේක කාලය', appearance: 'පෙනුම', reduceMotion: 'චලනය' },
  questions: {
    focus_duration: { title: 'කොපමණ වේලාවක් වැඩ කරන්න කැමතිද?', detail: 'මෙය ආරම්භක තේරීමක් පමණයි. එක් එක් සැසියට පෙර නැවත තෝරාගත හැකියි.', options: { '25': 'මිනිත්තු 25 · කුඩා ආරම්භයක්', '45': 'මිනිත්තු 45 · ස්ථාවර කාල කොටසක්', '60': 'මිනිත්තු 60 · තව ටිකක් ඉඩක්' } },
    break_duration: { title: 'නැවුම් වීමට ඉඩක් තබමු.', detail: 'විවේක සඳහා ආරම්භක කාලයක් තෝරන්න. විවේකයක් ගැනීම සැමවිටම ඔබේ තේරීමයි.', options: { '5': 'මිනිත්තු 5 · කෙටි විරාමයක්', '10': 'මිනිත්තු 10 · තව ටිකක් නිදහසක්', '15': 'මිනිත්තු 15 · සන්සුන් විවේකයක්' } },
    appearance: { title: 'ඔබේ ඇසට පහසු පෙනුම කුමක්ද?', detail: 'ඇප් එකේ පෙනුම තෝරන්න. පසුව Profile එකෙන් වෙනස් කළ හැකියි.', options: { system: 'උපාංගයට අනුව', light: 'ආලෝක · මෘදු හා විවෘත', dark: 'අඳුරු · සන්සුන් හා නිහඬ' } },
    motion: { title: 'සැරසිලි චලනය අඩු කරමුද?', detail: 'උපාංගයේ චලනය අඩු කිරීමේ සැකසුම සැමවිටම ගරු කරනවා.', options: { system: 'උපාංගයට අනුව', reduced: 'සැරසිලි චලනය අඩු කරන්න' } },
  },
};
const ta: Copy = {
  welcome: 'அமைதியான தொடக்கம்.', intro: 'இந்த இடத்தை உங்களுக்கு ஏற்றதாக அமைக்கலாம். முதலில் மொழியையும், பிறகு நான்கு எளிய விருப்பங்களையும் தேர்ந்தெடுக்கவும். பின்னர் மாற்றலாம்.',
  language: 'எந்த மொழியை விரும்புகிறீர்கள்?', languageHint: 'இது செயலியின் மொழியை மட்டுமே மாற்றும்.',
  next: 'தொடரவும்', review: 'தேர்வுகளை மீளாய்வு செய்', back: 'பின்செல்', skip: 'பின்னர் அமை · வரைவை வைத்திரு', skipQuestion: 'இந்தக் கேள்வியைத் தவிர்',
  privacy: 'இந்தக் கணக்கிற்காக இந்தச் சாதனத்தில் மட்டும் சேமிக்கப்படும். AI, அனுமதி அல்லது பகிர்வு இல்லை. ஏற்கனவே உள்ள வேலை மாறாது.',
  step: 'படி {current} / 5', loading: 'சேமித்த தேர்வுகள் ஏற்றப்படுகின்றன…', saving: 'சேமிக்கப்படுகிறது…', retry: 'மீண்டும் முயற்சி',
  failed: 'தேர்வுகளைச் சேமிக்கவோ ஏற்றவோ முடியவில்லை. தற்போதைய அமைப்புகள் மாற்றப்படவில்லை. மீண்டும் முயற்சிக்கவும்.',
  conflict: 'மீளாய்வுக்குப் பின் தரவு மாறியுள்ளது. சேமித்த தேர்வுகளை மீண்டும் ஏற்றி மீளாய்வு செய்யவும். மாற்றங்கள் பயன்படுத்தப்படவில்லை.',
  keep: 'தற்போதைய அமைப்பை வைத்திரு', reviewTitle: 'உங்களுக்கு ஏற்ற தொடக்கம்.',
  reviewDetail: 'பயன்படுத்த வேண்டிய மாற்றங்களைத் தேர்ந்தெடுக்கவும். எதுவும் தானாகத் தேர்வாகாது. நேரத் தேர்வுகள் அடுத்த அமர்வுகளுக்கானவை; இயங்கும் அமர்வை மாற்றாது.',
  current: 'தற்போது', proposed: 'பரிந்துரை', apply: 'தேர்ந்த மாற்றங்களைப் பயன்படுத்து', unchanged: 'அமைப்புகளை மாற்ற வேண்டியதில்லை.',
  continue: 'மாற்றமின்றித் தொடரவும்', applied: 'உங்கள் தேர்வுகள் சேமிக்கப்பட்டன.', reviewAgain: 'மீண்டும் மீளாய்வு செய்', redo: 'மீண்டும் தனிப்பயனாக்கு', navError: 'தொடர முடியவில்லை. தேர்வுகள் உள்ளன. மீண்டும் முயற்சிக்கவும்.',
  fields: { defaultFocusDurationMinutes: 'கவன நேரம்', defaultBreakDurationMinutes: 'இடைவேளை நேரம்', appearance: 'தோற்றம்', reduceMotion: 'இயக்கம்' },
  questions: {
    focus_duration: { title: 'எவ்வளவு நேரம் கவனம் செலுத்த விரும்புகிறீர்கள்?', detail: 'இது ஒரு தொடக்கத் தேர்வு மட்டுமே. ஒவ்வொரு அமர்வுக்கும் முன்பும் மாற்றலாம்.', options: { '25': '25 நிமிடங்கள் · சிறிய தொடக்கம்', '45': '45 நிமிடங்கள் · நிலையான நேரம்', '60': '60 நிமிடங்கள் · கூடுதல் இடம்' } },
    break_duration: { title: 'புத்துணர்வுக்கு இடமளிக்கலாம்.', detail: 'இடைவேளைகளுக்கான தொடக்க நேரத்தைத் தேர்ந்தெடுக்கவும். இடைவேளை எடுப்பது உங்கள் விருப்பம்.', options: { '5': '5 நிமிடங்கள் · சிறிய இடைவேளை', '10': '10 நிமிடங்கள் · சற்று ஓய்வு', '15': '15 நிமிடங்கள் · நிதானமான ஓய்வு' } },
    appearance: { title: 'எந்தத் தோற்றம் வசதியாக உள்ளது?', detail: 'செயலியின் தோற்றத்தைத் தேர்ந்தெடுக்கவும். பின்னர் Profile இல் மாற்றலாம்.', options: { system: 'சாதனத்தைப் பின்பற்று', light: 'ஒளி · மென்மையான தோற்றம்', dark: 'இருள் · அமைதியான தோற்றம்' } },
    motion: { title: 'அலங்கார இயக்கத்தைக் குறைக்கலாமா?', detail: 'சாதனத்தின் இயக்கக் குறைப்பு அமைப்பு எப்போதும் மதிக்கப்படும்.', options: { system: 'சாதனத்தைப் பின்பற்று', reduced: 'அலங்கார இயக்கத்தைக் குறை' } },
  },
};
export const getSetupCopy = (locale: AppLocale): Copy => ({ en, si, ta })[locale];
export function setupValueLabel(copy: Copy, field: SetupField, value: number | string | boolean): string {
  if (field === 'defaultFocusDurationMinutes') return copy.questions.focus_duration.options[String(value)];
  if (field === 'defaultBreakDurationMinutes') return copy.questions.break_duration.options[String(value)];
  if (field === 'appearance') return copy.questions.appearance.options[String(value)];
  return copy.questions.motion.options[value === true ? 'reduced' : 'system'];
}
