import type { AppLocale } from '@/features/settings/settings-storage';
const en = {
  title: 'A little more you.', look: 'Look & feel', system: 'System', light: 'Light', dark: 'Dark',
  motion: 'Reduce motion', motionHint: 'The system preference is always respected.',
  words: 'Words that keep you going', default: 'Deep Focus words', personal: 'My own words', off: 'Off',
  phrase: 'Your phrase', focus: 'Show during focus', focusHint: 'One steady phrase, no interruptions. Changes apply to the next session; switching Off hides it now.',
  privacy: 'Saved for this account on this device only. Personal words are not sent to the cloud or session history.',
  save: 'Save preferences', saved: 'Preferences saved.', failed: 'Could not save. Your draft is still here.',
  loading: 'Loading preferences…', unavailable: 'Preferences could not be loaded.', retry: 'Retry', invalid: 'Use up to 240 characters without control characters.',
};
const copy: Record<AppLocale, typeof en> = {
  en,
  si: {
    title: 'ඔබට ගැළපෙන සන්සුන් පෙනුමක්.', look: 'පෙනුම සහ චලනය', system: 'උපාංගයට අනුව', light: 'ආලෝක මාදිලිය', dark: 'අඳුරු මාදිලිය',
    motion: 'චලනය අඩු කරන්න', motionHint: 'උපාංගයේ චලනය අඩු කිරීමේ තේරීම සැමවිටම ගරු කරනවා.',
    words: 'ඔබට දිරිය දෙන වචන', default: 'Deep Focus වචන', personal: 'මගේම වචන', off: 'පෙන්වන්න එපා',
    phrase: 'ඔබේ වාක්‍යය', focus: 'අවධානය යොමු කරන අතර පෙන්වන්න', focusHint: 'බාධා නැති එකම වාක්‍යයක්. වෙනස්කම් ඊළඟ සැසියටයි; අක්‍රිය කළොත් දැන්ම සඟවනවා.',
    privacy: 'මෙම ගිණුම සඳහා මේ උපාංගයේ පමණක් සුරකිනවා. පුද්ගලික වචන වලාකුළට හෝ සැසි ඉතිහාසයට යවන්නේ නැහැ.',
    save: 'සැකසුම් සුරකින්න', saved: 'සැකසුම් සුරැකුණා.', failed: 'සුරකින්න බැරි වුණා. ඔබේ වෙනස්කම් තවම මෙතැන තියෙනවා.',
    loading: 'සැකසුම් ලබාගන්නවා…', unavailable: 'සැකසුම් ලබාගන්න බැරි වුණා.', retry: 'නැවත උත්සාහ කරන්න', invalid: 'පාලන අක්ෂර නැතිව අක්ෂර 240ක් දක්වා යොදන්න.',
  },
  ta: {
    title: 'இந்த இடம் உங்களுக்காக.', look: 'தோற்றமும் இயக்கமும்', system: 'சாதனத்தின்படி', light: 'வெளிச்சம்', dark: 'இருள்',
    motion: 'இயக்கத்தைக் குறைக்கவும்', motionHint: 'சாதனத்தின் குறைந்த இயக்க விருப்பம் எப்போதும் மதிக்கப்படும்.',
    words: 'ஊக்கமளிக்கும் சொற்கள்', default: 'Deep Focus சொற்கள்', personal: 'எனது சொற்கள்', off: 'அணை',
    phrase: 'உங்கள் வாசகம்', focus: 'கவன நேரத்தில் காட்டு', focusHint: 'இடையூறின்றி ஒரே வாசகம். மாற்றங்கள் அடுத்த அமர்வுக்கு; அணைத்தால் உடனே மறையும்.',
    privacy: 'இந்தச் சாதனத்தில் இந்தக் கணக்கிற்கு மட்டும் சேமிக்கப்படும். தனிப்பட்ட சொற்கள் கிளவுட் அல்லது அமர்வு வரலாற்றிற்கு அனுப்பப்படாது.',
    save: 'விருப்பங்களைச் சேமி', saved: 'விருப்பங்கள் சேமிக்கப்பட்டன.', failed: 'சேமிக்க முடியவில்லை. உங்கள் மாற்றங்கள் இங்கே உள்ளன.',
    loading: 'விருப்பங்கள் ஏற்றப்படுகின்றன…', unavailable: 'விருப்பங்களை ஏற்ற முடியவில்லை.', retry: 'மீண்டும் முயற்சி', invalid: 'கட்டுப்பாட்டு எழுத்துகளின்றி 240 எழுத்துகள் வரை பயன்படுத்தவும்.',
  },
};
export const getPresentationCopy = (locale: AppLocale) => copy[locale];
