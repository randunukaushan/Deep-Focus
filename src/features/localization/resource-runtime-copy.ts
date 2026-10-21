import type { AppLocale } from '@/features/settings/settings-storage';

export type ResourceRuntimeCopy = {
  rename: string;
  renameTitle: string;
  saveRename: string;
  cancelRename: string;
  renameConflict: string;
};

const COPY: Record<AppLocale, ResourceRuntimeCopy> = {
  en: { rename: 'Rename', renameTitle: 'Resource title', saveRename: 'Save name', cancelRename: 'Cancel', renameConflict: 'This resource changed elsewhere. Reload before renaming it.' },
  si: { rename: 'නම වෙනස් කරන්න', renameTitle: 'සම්පතේ නම', saveRename: 'නම සුරකින්න', cancelRename: 'අවලංගු කරන්න', renameConflict: 'මෙම සම්පත වෙනත් තැනක වෙනස් වී ඇත. නම වෙනස් කිරීමට පෙර නැවත පූරණය කරන්න.' },
  ta: { rename: 'பெயரை மாற்றவும்', renameTitle: 'வளத்தின் பெயர்', saveRename: 'பெயரைச் சேமிக்கவும்', cancelRename: 'ரத்துசெய்', renameConflict: 'இந்த வளம் வேறு இடத்தில் மாற்றப்பட்டுள்ளது. பெயரை மாற்றுவதற்கு முன் மீண்டும் ஏற்றவும்.' },
};

export function getResourceRuntimeCopy(locale: AppLocale): ResourceRuntimeCopy {
  return COPY[locale] ?? COPY.en;
}
