import type { AppLocale } from '@/features/settings/settings-storage';

type ProfileEducationCopy = {
  label: string;
  detail: string;
};

const COPY: Record<AppLocale, ProfileEducationCopy> = {
  en: {
    label: 'Education assignments',
    detail: 'Create a local teacher assignment draft.',
  },
  si: {
    label: 'අධ්‍යාපන කාර්ය',
    detail: 'දේශීයව ගුරුවරුන් සඳහා කාර්ය කෙටුම්පතක් සකස් කරන්න.',
  },
  ta: {
    label: 'கல்விப் பணி',
    detail: 'உள்ளூரில் ஆசிரியர்களுக்கான பணி வரைவை உருவாக்கவும்.',
  },
};

export function getProfileEducationCopy(locale: AppLocale): ProfileEducationCopy {
  return COPY[locale] ?? COPY.en;
}
