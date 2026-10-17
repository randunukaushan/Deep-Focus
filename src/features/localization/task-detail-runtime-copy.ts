import type { AppLocale } from '@/features/settings/settings-storage';

export type TaskDetailRuntimeCopy = {
  invalidDate: string;
  conflictSave: string;
  saveError: string;
  conflictDelete: string;
  deleteError: string;
  conflictArchive: string;
  archiveError: string;
};

const COPY: Record<AppLocale, TaskDetailRuntimeCopy> = {
  en: {
    invalidDate: 'Enter a valid calendar date as YYYY-MM-DD, or leave it blank to remove the deadline.',
    conflictSave: 'This task changed elsewhere. Reload it before editing so newer details are not overwritten.',
    saveError: 'This task could not be saved. Your saved task is unchanged; try again.',
    conflictDelete: 'This task changed elsewhere. Reload it before deleting so newer details are not removed.',
    deleteError: 'This task could not be deleted. Your task and focus history are unchanged; try again.',
    conflictArchive: 'This task changed elsewhere. Reload it before changing its archive state.',
    archiveError: 'This task could not be updated. Its saved archive state is unchanged; try again.',
  },
  si: {
    invalidDate: 'YYYY-MM-DD ආකෘතියෙන් නිවැරදි දිනයක් ඇතුළත් කරන්න, නැතහොත් අවසන් දිනය ඉවත් කිරීමට හිස්ව තබන්න.',
    conflictSave: 'මෙම කාර්යය වෙනත් තැනක වෙනස් කර ඇත. නව විස්තර මත ලියවීම වැළැක්වීමට සංස්කරණයට පෙර එය නැවත පූරණය කරන්න.',
    saveError: 'මෙම කාර්යය සුරැකිය නොහැක. සුරකින ලද කාර්යය වෙනස් කර නැත; නැවත උත්සාහ කරන්න.',
    conflictDelete: 'මෙම කාර්යය වෙනත් තැනක වෙනස් කර ඇත. නව විස්තර මැකීම වැළැක්වීමට මැකීමට පෙර එය නැවත පූරණය කරන්න.',
    deleteError: 'මෙම කාර්යය මැකිය නොහැක. ඔබේ කාර්යය සහ අවධානයේ ඉතිහාසය වෙනස් කර නැත; නැවත උත්සාහ කරන්න.',
    conflictArchive: 'මෙම කාර්යය වෙනත් තැනක වෙනස් කර ඇත. සංරක්ෂිත තත්ත්වය වෙනස් කිරීමට පෙර එය නැවත පූරණය කරන්න.',
    archiveError: 'මෙම කාර්යය යාවත්කාලීන කළ නොහැක. එහි සුරකින ලද සංරක්ෂිත තත්ත්වය වෙනස් කර නැත; නැවත උත්සාහ කරන්න.',
  },
  ta: {
    invalidDate: 'YYYY-MM-DD வடிவில் சரியான தேதியை உள்ளிடவும் அல்லது காலக்கெடுவை நீக்க வெறுமையாக விடவும்.',
    conflictSave: 'இந்தப் பணி வேறு இடத்தில் மாற்றப்பட்டுள்ளது. புதிய விவரங்கள் மேலெழுதப்படாமல் இருக்கத் திருத்துவதற்கு முன் மீண்டும் ஏற்றவும்.',
    saveError: 'இந்தப் பணியைச் சேமிக்க முடியவில்லை. சேமித்த பணி மாற்றப்படவில்லை; மீண்டும் முயற்சிக்கவும்.',
    conflictDelete: 'இந்தப் பணி வேறு இடத்தில் மாற்றப்பட்டுள்ளது. புதிய விவரங்கள் நீக்கப்படாமல் இருக்க நீக்கும் முன் மீண்டும் ஏற்றவும்.',
    deleteError: 'இந்தப் பணியை நீக்க முடியவில்லை. உங்கள் பணியும் கவன வரலாறும் மாற்றப்படவில்லை; மீண்டும் முயற்சிக்கவும்.',
    conflictArchive: 'இந்தப் பணி வேறு இடத்தில் மாற்றப்பட்டுள்ளது. காப்பக நிலையை மாற்றுவதற்கு முன் மீண்டும் ஏற்றவும்.',
    archiveError: 'இந்தப் பணியைப் புதுப்பிக்க முடியவில்லை. சேமித்த காப்பக நிலை மாற்றப்படவில்லை; மீண்டும் முயற்சிக்கவும்.',
  },
};

export function getTaskDetailRuntimeCopy(locale: AppLocale): TaskDetailRuntimeCopy {
  return COPY[locale] ?? COPY.en;
}
