import type { AppLocale } from '@/features/settings/settings-storage';

const EN = {
  greeting: 'A plan that makes space for you', title: 'Your day, gently organized.',
  today: 'Today', upcoming: 'Upcoming', period: 'Plan period', things: 'things to work on',
  timeHint: 'planned, not a deadline', priorities: 'Your priorities', lookingAhead: 'Looking ahead', done: 'done',
  add: 'Add a task', addTitle: 'Make a little space.', addHint: 'Add one thing you want to work on.',
  titleField: 'Task name', minutesField: 'Estimated minutes (optional)', dateField: 'Planned date (YYYY-MM-DD)',
  dateHint: 'A plan, not a deadline. Earlier and undated tasks stay in Today.',
  invalid: 'Enter a task name, a real planned date, and optional whole minutes from 1 to 480.',
  save: 'Add to my plan', cancel: 'Cancel', empty: 'A little open space. Add something when you’re ready.',
  encouragement: 'You don’t have to do everything. Give the next thing your attention.',
  minute: 'min', noEstimate: 'No estimate', unestimated: 'without an estimate',
  localOnly: 'Planning dates and estimates are saved on this device. Cloud sync is not active for these fields.',
  saving: 'Saving task…', appearance: 'Appearance settings',
};
type TaskPlanCopy = typeof EN;
const COPY: Record<AppLocale, TaskPlanCopy> = {
  en: EN,
  si: {
    greeting: 'ඔබට ඉඩ සලසන සැලැස්මක්', title: 'ඔබේ දවස, සන්සුන්ව සැලසුම් කරමු.',
    today: 'අද', upcoming: 'ඉදිරියේදී', period: 'සැලසුම් කාලය', things: 'වැඩ කිරීමට ඇති කාර්ය',
    timeHint: 'සැලසුම් කළ කාලය මිස deadline එකක් නොවේ', priorities: 'ඔබේ ප්‍රමුඛ කාර්ය', lookingAhead: 'ඉදිරියට බලමු', done: 'නිම කළ',
    add: 'කාර්යයක් එක් කරන්න', addTitle: 'පොඩි ඉඩක් සාදමු.', addHint: 'ඔබ වැඩ කිරීමට කැමති එක දෙයක් එක් කරන්න.',
    titleField: 'කාර්යයේ නම', minutesField: 'ඇස්තමේන්තු මිනිත්තු (අත්‍යවශ්‍ය නැත)', dateField: 'සැලසුම් දිනය (YYYY-MM-DD)',
    dateHint: 'මෙය සැලැස්මක් මිස deadline එකක් නොවේ. කලින් දිනවල සහ දිනයක් නැති කාර්ය අද ලැයිස්තුවේ පවතී.',
    invalid: 'කාර්යයේ නම සහ වලංගු සැලසුම් දිනයක් ඇතුළත් කරන්න. මිනිත්තු දමන්නේ නම් 1 සිට 480 දක්වා පූර්ණ අගයක් යොදන්න.',
    save: 'මගේ සැලැස්මට එක් කරන්න', cancel: 'අවලංගු කරන්න', empty: 'පොඩි විවෘත ඉඩක්. ඔබ සූදානම් වූ විට කාර්යයක් එක් කරන්න.',
    encouragement: 'හැම දෙයක්ම කළ යුතු නැහැ. ඊළඟ එක දෙයට ඔබේ අවධානය දෙන්න.',
    minute: 'මිනි.', noEstimate: 'කාලය ඇස්තමේන්තු කර නැත', unestimated: 'කාලය ඇස්තමේන්තු නොකළ',
    localOnly: 'සැලසුම් දින සහ කාල ඇස්තමේන්තු මෙම උපාංගයේ සුරැකේ. මෙම දත්ත සඳහා cloud sync තවම සක්‍රිය නැත.',
    saving: 'කාර්යය සුරකිමින්…', appearance: 'පෙනුම සැකසීම',
  },
  ta: {
    greeting: 'உங்களுக்காக இடமளிக்கும் திட்டம்', title: 'உங்கள் நாளை அமைதியாக ஒழுங்குபடுத்துங்கள்.',
    today: 'இன்று', upcoming: 'வரவிருப்பவை', period: 'திட்டக் காலம்', things: 'செய்ய வேண்டிய பணிகள்',
    timeHint: 'திட்டமிட்ட நேரம், காலக்கெடு அல்ல', priorities: 'உங்கள் முன்னுரிமைகள்', lookingAhead: 'முன்னோக்கிப் பாருங்கள்', done: 'முடிந்தது',
    add: 'பணியைச் சேர்க்கவும்', addTitle: 'சிறிது இடமளியுங்கள்.', addHint: 'நீங்கள் செய்ய விரும்பும் ஒரு பணியைச் சேர்க்கவும்.',
    titleField: 'பணி பெயர்', minutesField: 'மதிப்பிட்ட நிமிடங்கள் (விருப்பம்)', dateField: 'திட்டமிட்ட தேதி (YYYY-MM-DD)',
    dateHint: 'இது திட்டம், காலக்கெடு அல்ல. முந்தைய மற்றும் தேதியில்லாத பணிகள் இன்றைய பட்டியலில் இருக்கும்.',
    invalid: 'பணி பெயர், செல்லுபடியாகும் தேதி மற்றும் விருப்பமாக 1 முதல் 480 வரையிலான முழு நிமிடங்களை உள்ளிடவும்.',
    save: 'என் திட்டத்தில் சேர்க்கவும்', cancel: 'ரத்து செய்', empty: 'சிறிது திறந்த இடம். தயாரானபோது ஒரு பணியைச் சேர்க்கவும்.',
    encouragement: 'எல்லாவற்றையும் செய்ய வேண்டியதில்லை. அடுத்த ஒரு பணியில் கவனம் செலுத்துங்கள்.',
    minute: 'நிமி.', noEstimate: 'நேர மதிப்பீடு இல்லை', unestimated: 'மதிப்பீடு இல்லாதவை',
    localOnly: 'திட்டத் தேதிகளும் நேர மதிப்பீடுகளும் இந்தச் சாதனத்தில் சேமிக்கப்படும். இவற்றின் மேக ஒத்திசைவு இன்னும் செயல்படவில்லை.',
    saving: 'பணி சேமிக்கப்படுகிறது…', appearance: 'தோற்ற அமைப்புகள்',
  },
};

export function getTaskPlanCopy(locale: AppLocale): TaskPlanCopy { return COPY[locale] ?? EN; }
