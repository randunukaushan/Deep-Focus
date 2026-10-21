import type { Locale } from './locale';

export type ContentPageCopy = {
  reviewPending: string;
  currentBuildStatus: string;
  readinessTitle: string;
  readinessDetail: string;
  statusLabels: Record<'in_development' | 'prototype' | 'planned', string>;
  statusDate: string;
  releaseVersion: string;
  notReleased: string;
  readinessNote: string;
  roadmapLink: string;
};

const COPY: Record<Locale, ContentPageCopy> = {
  en: { reviewPending: 'Not final — review and product details are still being completed.', currentBuildStatus: 'CURRENT BUILD STATUS', readinessTitle: 'What works, what is still being built.', readinessDetail: 'No public app release is available yet; statuses may change as reviews and device checks finish.', statusLabels: { in_development: 'In development', prototype: 'Prototype', planned: 'Planned' }, statusDate: 'Status date', releaseVersion: 'Release version', notReleased: 'Not released', readinessNote: 'These are development-status notes, not release promises.', roadmapLink: 'Read the roadmap' },
  si: { reviewPending: 'මෙය අවසන් කර නැත — සමාලෝචනය සහ නිෂ්පාදන විස්තර තවම සම්පූර්ණ කරමින් පවතී.', currentBuildStatus: 'වත්මන් සංවර්ධන තත්ත්වය', readinessTitle: 'වැඩ කරන දේ සහ තවම සකස් කරන දේ.', readinessDetail: 'තවම public app නිකුතුවක් නැත; සමාලෝචන සහ device checks අවසන් වන විට තත්ත්ව වෙනස් විය හැක.', statusLabels: { in_development: 'සංවර්ධනය වෙමින්', prototype: 'මූලික ආකෘතිය', planned: 'සැලසුම් කර ඇත' }, statusDate: 'තත්ත්ව දිනය', releaseVersion: 'නිකුතු අනුවාදය', notReleased: 'නිකුත් කර නැත', readinessNote: 'මේවා සංවර්ධන තත්ත්ව සටහන් පමණි; නිකුතු පොරොන්දු නොවේ.', roadmapLink: 'ඉදිරි සැලැස්ම බලන්න' },
  ta: { reviewPending: 'இது இறுதியானது அல்ல — மதிப்பாய்வும் தயாரிப்பு விவரங்களும் இன்னும் நிறைவுபெறுகின்றன.', currentBuildStatus: 'தற்போதைய உருவாக்க நிலை', readinessTitle: 'செயல்படுவது மற்றும் இன்னும் உருவாக்கப்படுவது.', readinessDetail: 'பொது செயலி வெளியீடு இன்னும் இல்லை; மதிப்பாய்வுகளும் சாதனச் சோதனைகளும் முடிந்தபின் நிலைகள் மாறலாம்.', statusLabels: { in_development: 'உருவாக்கத்தில்', prototype: 'முன்மாதிரி', planned: 'திட்டமிடப்பட்டது' }, statusDate: 'நிலை நாள்', releaseVersion: 'வெளியீட்டு பதிப்பு', notReleased: 'வெளியிடப்படவில்லை', readinessNote: 'இவை உருவாக்க நிலைக் குறிப்புகள் மட்டுமே; வெளியீட்டு வாக்குறுதிகள் அல்ல.', roadmapLink: 'வழித்திட்டத்தைப் பார்க்கவும்' },
};

export function getContentPageCopy(locale: Locale): ContentPageCopy {
  return COPY[locale] ?? COPY.en;
}
