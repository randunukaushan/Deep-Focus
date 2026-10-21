import type { Locale } from './locale';

export type AccountPrivacyCopy = {
  title: string;
  summaryDescription: string;
  downloadSummary: string;
  summaryExportNote: string;
  deletionTitle: string;
  deletionDescription: string;
  deletionPending: string;
};

export const accountPrivacyCopy: Record<Locale, AccountPrivacyCopy> = {
  en: {
    title: 'Privacy controls',
    summaryDescription: 'Download the account summary visible to this portal. Private app data is not included while sync is disabled.',
    downloadSummary: 'Download account summary',
    summaryExportNote: 'This preview exports portal-visible account status only; private app data is not included.',
    deletionTitle: 'Account deletion',
    deletionDescription: 'Deletion requires a reviewed server workflow so identity, local ownership and remote data are handled safely.',
    deletionPending: 'Not available in this development preview',
  },
  si: {
    title: 'පෞද්ගලිකත්ව පාලන',
    summaryDescription: 'මෙම portal එකට පෙනෙන ගිණුම් සාරාංශය download කරගන්න. සමමුහුර්ත කිරීම අක්‍රිය නිසා පෞද්ගලික app data ඇතුළත් නොවේ.',
    downloadSummary: 'ගිණුම් සාරාංශය download කරන්න',
    summaryExportNote: 'මෙම පෙරදසුන portal එකට පෙනෙන ගිණුම් තත්ත්වය පමණක් export කරයි; පෞද්ගලික app data ඇතුළත් නොවේ.',
    deletionTitle: 'ගිණුම මකා දැමීම',
    deletionDescription: 'අනන්‍යතාව, local හිමිකාරීත්වය සහ remote data ආරක්ෂිතව කළමනාකරණය කිරීමට reviewed server workflow එකක් අවශ්‍යයි.',
    deletionPending: 'මෙම සංවර්ධන පෙරදසුනේ ලබාගත නොහැක',
  },
  ta: {
    title: 'தனியுரிமைக் கட்டுப்பாடுகள்',
    summaryDescription: 'இந்தப் பகுதி காணக்கூடிய கணக்கு சுருக்கத்தைப் பதிவிறக்கவும். ஒத்திசைவு முடக்கப்பட்டுள்ளதால் தனிப்பட்ட பயன்பாட்டுத் தரவு சேர்க்கப்படாது.',
    downloadSummary: 'கணக்கு சுருக்கத்தைப் பதிவிறக்கவும்',
    summaryExportNote: 'இந்த முன்னோட்டம் பகுதியிற்கு தெரியும் கணக்கு நிலையை மட்டும் ஏற்றுமதி செய்கிறது; தனிப்பட்ட பயன்பாட்டுத் தரவு சேர்க்கப்படாது.',
    deletionTitle: 'கணக்கை நீக்குதல்',
    deletionDescription: 'அடையாளம், உள்ளூர் உரிமை மற்றும் தொலைநிலைத் தரவைப் பாதுகாப்பாக கையாள மதிப்பாய்வு செய்யப்பட்ட சேவையகப் பணிச்சுற்று தேவை.',
    deletionPending: 'இந்த மேம்பாட்டு முன்னோட்டத்தில் கிடைக்காது',
  },
};
