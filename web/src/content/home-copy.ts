import type { Locale } from './locale';

export const homeCopy: Record<Locale, {
  eyebrow: string;
  title: string;
  description: string;
  explore: string;
  roadmap: string;
  reassurance: string;
  principlesLabel: string;
  principles: { title: string; body: string }[];
  statusEyebrow: string;
  statusTitle: string;
  statusBody: string;
  help: string;
  oneThing: string;
}> = {
  en: {
    eyebrow: 'A QUIETER WAY TO MAKE PROGRESS',
    title: 'Focus on what matters.',
    description: 'Deep Focus is being built to help you choose a next step, protect a little time for it, and return gently when your day changes.',
    explore: 'Explore the product', roadmap: 'See what is in progress', reassurance: 'No streak debt. No pressure to share your work.',
    principlesLabel: 'Product principles',
    principles: [
      { title: 'Choose a direction', body: 'Keep tasks and meaningful goals close without turning your day into a scoreboard.' },
      { title: 'Make room to focus', body: 'Use a timer you control, with clear pause and exit choices.' },
      { title: 'Come back calmly', body: 'Interrupted time is part of real life. Your progress should reflect the work you did.' },
    ],
    statusEyebrow: 'CURRENT STATUS', statusTitle: 'This is a development preview.',
    statusBody: 'Accounts, purchases, downloads and online services are not available from this site.',
    help: 'Read the preview notes', oneThing: 'one thing',
  },
  si: {
    eyebrow: 'සන්සුන්ව ඉදිරියට යන මඟක්',
    title: 'වැදගත් දේට අවධානය දෙන්න.',
    description: 'ඊළඟට කළ යුතු දේ තෝරාගෙන, ඒ සඳහා ටික වේලාවක් වෙන් කර, දවස වෙනස් වූ විට නැවත සන්සුන්ව පටන්ගන්න Deep Focus නිර්මාණය කරමින් පවතී.',
    explore: 'යෙදුම ගැන බලන්න', roadmap: 'දැනට සිදුවන වැඩ බලන්න', reassurance: 'දින ගණන් අහිමි වීමේ දඬුවම් නැහැ. ඔබේ වැඩ බෙදාගන්න බලපෑමක් නැහැ.',
    principlesLabel: 'නිෂ්පාදනයේ මූලික අදහස්',
    principles: [
      { title: 'දිශාවක් තෝරගන්න', body: 'දවස ලකුණු පුවරුවක් නොකර, කාර්යයන් සහ ඔබට වැදගත් අරමුණු ළඟින් තබාගන්න.' },
      { title: 'අවධානයට ඉඩක් වෙන්කරගන්න', body: 'ඔබම පාලනය කරන කාල ගණකයක් සහ පැහැදිලි විරාම හා නතර කිරීමේ තේරීම් භාවිත කරන්න.' },
      { title: 'සන්සුන්ව නැවත පටන්ගන්න', body: 'වැඩ අතරමඟ නතර වීම ජීවිතයේ සාමාන්‍ය දෙයක්. ඔබේ ප්‍රගතිය කළ සැබෑ වැඩ පෙන්විය යුතුයි.' },
    ],
    statusEyebrow: 'දැනට ඇති තත්ත්වය', statusTitle: 'මෙය සංවර්ධන පෙරදසුනකි.',
    statusBody: 'මෙම වෙබ් අඩවියෙන් ගිණුම්, මිලදී ගැනීම්, බාගත කිරීම් හෝ මාර්ගගත සේවා ලබාගත නොහැක.',
    help: 'පෙරදසුන පිළිබඳ සටහන් කියවන්න', oneThing: 'එක දෙයක්',
  },
  ta: {
    eyebrow: 'அமைதியாக முன்னேறும் வழி',
    title: 'முக்கியமானவற்றில் கவனம் செலுத்துங்கள்.',
    description: 'அடுத்த படியைத் தேர்ந்தெடுத்து, அதற்குச் சிறிது நேரம் ஒதுக்கி, நாள் மாறும்போது அமைதியாகத் தொடர உதவ Deep Focus உருவாக்கப்படுகிறது.',
    explore: 'செயலியைப் பற்றி அறியுங்கள்', roadmap: 'நடைபெறும் பணிகளைப் பாருங்கள்', reassurance: 'தொடர் நாட்கள் தவறியதற்குத் தண்டனை இல்லை. உங்கள் வேலையைப் பகிர அழுத்தமும் இல்லை.',
    principlesLabel: 'தயாரிப்பு அடிப்படைகள்',
    principles: [
      { title: 'ஒரு திசையைத் தேர்ந்தெடுங்கள்', body: 'உங்கள் நாளை மதிப்பெண் பலகையாக்காமல், பணிகளையும் அர்த்தமுள்ள இலக்குகளையும் அருகில் வைத்திருங்கள்.' },
      { title: 'கவனத்திற்கு நேரம் ஒதுக்குங்கள்', body: 'நீங்கள் கட்டுப்படுத்தும் நேரக் கணிப்பையும் தெளிவான இடைநிறுத்தம் மற்றும் வெளியேறும் தேர்வுகளையும் பயன்படுத்துங்கள்.' },
      { title: 'அமைதியாகத் திரும்புங்கள்', body: 'இடையில் தடை ஏற்படுவது வாழ்க்கையின் ஒரு பகுதி. உங்கள் முன்னேற்றம் நீங்கள் செய்த வேலையைப் பிரதிபலிக்க வேண்டும்.' },
    ],
    statusEyebrow: 'தற்போதைய நிலை', statusTitle: 'இது உருவாக்கப் பணியின் முன்னோட்டம்.',
    statusBody: 'இந்த இணையதளத்தில் கணக்குகள், கொள்முதல், பதிவிறக்கங்கள் அல்லது இணையச் சேவைகள் இல்லை.',
    help: 'முன்னோட்டக் குறிப்புகளைப் படியுங்கள்', oneThing: 'ஒரு செயல்',
  },
};
