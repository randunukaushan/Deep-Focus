import type { AppLocale } from '@/features/settings/settings-storage';

export type TeacherAssignmentCopy = {
  back: string;
  eyebrow: string;
  title: string;
  detail: string;
  classId: string;
  titleLabel: string;
  instructions: string;
  save: string;
  saving: string;
  saved: string;
  loadError: string;
  saveError: string;
};

const COPY: Record<AppLocale, TeacherAssignmentCopy> = {
  en: { back: 'Back', eyebrow: 'EDUCATION FOUNDATION', title: 'Create an assignment draft', detail: 'This stays on this device. No invite or cloud sharing is performed yet.', classId: 'Class identifier', titleLabel: 'Title', instructions: 'Instructions', save: 'Save local draft', saving: 'Saving…', saved: 'Local draft saved.', loadError: 'Draft could not be read.', saveError: 'Draft could not be saved.' },
  si: { back: 'ආපසු', eyebrow: 'අධ්‍යාපන පදනම', title: 'පැවරුම් කෙටුම්පතක් සකස් කරන්න', detail: 'මෙය මෙම උපාංගයේම සුරකිනු ඇත. තවමත් කිසිදු ආරාධනාවක් හෝ වලාකුළු බෙදාගැනීමක් සිදු නොවේ.', classId: 'පන්තියේ හඳුනාගැනීම', titleLabel: 'මාතෘකාව', instructions: 'උපදෙස්', save: 'දේශීය කෙටුම්පත සුරකින්න', saving: 'සුරකිමින්…', saved: 'දේශීය කෙටුම්පත සුරකින ලදී.', loadError: 'කෙටුම්පත කියවිය නොහැක.', saveError: 'කෙටුම්පත සුරැකිය නොහැක.' },
  ta: { back: 'திரும்பு', eyebrow: 'கல்வி அடித்தளம்', title: 'பணி வரைவை உருவாக்கவும்', detail: 'இது இந்தச் சாதனத்தில் மட்டும் சேமிக்கப்படும். இன்னும் எந்த அழைப்பும் அல்லது மேகப் பகிர்வும் நடைபெறாது.', classId: 'வகுப்பு அடையாளம்', titleLabel: 'தலைப்பு', instructions: 'வழிமுறைகள்', save: 'உள்ளூர் பணிவரைவைச் சேமிக்கவும்', saving: 'சேமிக்கப்படுகிறது…', saved: 'உள்ளூர் பணிவரைவு சேமிக்கப்பட்டது.', loadError: 'பணிவரைவைப் படிக்க முடியவில்லை.', saveError: 'பணிவரைவைச் சேமிக்க முடியவில்லை.' },
};

export function getTeacherAssignmentCopy(locale: AppLocale): TeacherAssignmentCopy {
  return COPY[locale] ?? COPY.en;
}
