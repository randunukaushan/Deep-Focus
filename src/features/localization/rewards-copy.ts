import type { AppLocale } from '@/features/settings/settings-storage';
import type { AchievementId } from '@/features/progress/progression-rules';

export type RewardsPageCopy = {
  eyebrow: string; title: string; subtitle: string; loading: string; errorTitle: string; errorDetail: string;
  retry: string; tryAgain: string; yourMilestones: string; unlockedSummary: string; completedSession: string;
  completedSessions: string; focused: string; milestones: string; emptyLabel: string; emptyTitle: string;
  emptyDetail: string; startFocus: string; latestDetail: string; unlocked: string; unlockedDetail: string;
  firstTitle: string; firstDetail: string; fiveTitle: string; fiveDetail: string; hourTitle: string; hourDetail: string; hoursUnit: string; minutesUnit: string;
};

const COPY: Record<AppLocale, RewardsPageCopy> = {
  en: {
    eyebrow: 'REWARDS', title: 'Notice the work you protect.', subtitle: 'Small milestones for sustainable focus, without pressure.', loading: 'Loading rewards', errorTitle: 'Rewards could not be loaded.', errorDetail: 'Your saved session history has not been changed. Try again to reload rewards.', retry: 'Retry loading rewards', tryAgain: 'Try again', yourMilestones: 'YOUR MILESTONES', unlockedSummary: 'unlocked', completedSession: 'completed session', completedSessions: 'completed sessions', focused: 'focused', milestones: 'MILESTONES', emptyLabel: 'No rewards unlocked yet', emptyTitle: 'YOUR FIRST MILESTONE IS CLOSE', emptyDetail: 'Start one calm focus session to begin your progress.', startFocus: 'Start Focus Session', latestDetail: 'Milestones are based on completed sessions saved locally.', unlocked: 'Unlocked', unlockedDetail: 'Unlocked · a meaningful step forward.', firstTitle: 'First protected block', firstDetail: 'Complete your first focus session.', fiveTitle: 'Five steady blocks', fiveDetail: 'Complete five focus sessions.', hourTitle: 'One hour of focus', hourDetail: 'Protect 60 minutes of focused time.', hoursUnit: 'h', minutesUnit: 'min',
  },
  si: {
    eyebrow: 'තෑගි', title: 'ඔබ ආරක්ෂා කරන වැඩ හඳුනාගන්න.', subtitle: 'පීඩනයකින් තොර තිරසාර අවධානය සඳහා කුඩා සන්ධිස්ථාන.', loading: 'තෑගි පූරණය කරමින්', errorTitle: 'තෑගි පූරණය කළ නොහැක.', errorDetail: 'ඔබේ සුරකින ලද සැසි ඉතිහාසය වෙනස් කර නැත. තෑගි නැවත පූරණය කිරීමට උත්සාහ කරන්න.', retry: 'තෑගි නැවත පූරණය කරන්න', tryAgain: 'නැවත උත්සාහ කරන්න', yourMilestones: 'ඔබේ සන්ධිස්ථාන', unlockedSummary: 'විවෘතයි', completedSession: 'සම්පූර්ණ කළ සැසිය', completedSessions: 'සම්පූර්ණ කළ සැසි', focused: 'අවධානය යොමු කළ', milestones: 'සන්ධිස්ථාන', emptyLabel: 'තවම තෑගි විවෘත කර නැත', emptyTitle: 'ඔබේ පළමු සන්ධිස්ථානය ළඟයි', emptyDetail: 'ඔබේ ප්‍රගතිය ආරම්භ කිරීමට එක් සන්සුන් අවධානයේ සැසියක් ආරම්භ කරන්න.', startFocus: 'අවධානයේ සැසිය ආරම්භ කරන්න', latestDetail: 'සන්ධිස්ථාන දේශීයව සුරකින ලද සම්පූර්ණ කළ සැසි මත පදනම් වේ.', unlocked: 'විවෘතයි', unlockedDetail: 'විවෘතයි · අර්ථවත් ඉදිරි පියවරක්.', firstTitle: 'පළමු ආරක්ෂා කළ කොටස', firstDetail: 'ඔබේ පළමු අවධානයේ සැසිය සම්පූර්ණ කරන්න.', fiveTitle: 'ස්ථාවර කොටස් පහක්', fiveDetail: 'අවධානයේ සැසි පහක් සම්පූර්ණ කරන්න.', hourTitle: 'පැයක අවධානය', hourDetail: 'මිනිත්තු 60ක අවධානය ආරක්ෂා කරන්න.', hoursUnit: 'පැය', minutesUnit: 'මිනි.',
  },
  ta: {
    eyebrow: 'வெகுமதிகள்', title: 'நீங்கள் பாதுகாக்கும் பணியை கவனியுங்கள்.', subtitle: 'அழுத்தமில்லாத நிலையான கவனத்திற்கான சிறிய முன்னேற்றங்கள்.', loading: 'வெகுமதிகள் ஏற்றப்படுகின்றன', errorTitle: 'வெகுமதிகளை ஏற்ற முடியவில்லை.', errorDetail: 'சேமித்த அமர்வு வரலாறு மாற்றப்படவில்லை. வெகுமதிகளை மீண்டும் ஏற்ற முயற்சிக்கவும்.', retry: 'வெகுமதிகளை மீண்டும் ஏற்றவும்', tryAgain: 'மீண்டும் முயற்சிக்கவும்', yourMilestones: 'உங்கள் முன்னேற்றங்கள்', unlockedSummary: 'திறக்கப்பட்டவை', completedSession: 'முடிக்கப்பட்ட அமர்வு', completedSessions: 'முடிக்கப்பட்ட அமர்வுகள்', focused: 'கவனம் செலுத்தப்பட்டது', milestones: 'முன்னேற்றங்கள்', emptyLabel: 'வெகுமதிகள் இன்னும் திறக்கப்படவில்லை', emptyTitle: 'உங்கள் முதல் முன்னேற்றம் அருகில் உள்ளது', emptyDetail: 'உங்கள் முன்னேற்றத்தைத் தொடங்க ஒரு அமைதியான கவன அமர்வைத் தொடங்கவும்.', startFocus: 'கவன அமர்வைத் தொடங்கவும்', latestDetail: 'முன்னேற்றங்கள் உள்ளூரில் சேமிக்கப்பட்ட முடிக்கப்பட்ட அமர்வுகளை அடிப்படையாகக் கொண்டவை.', unlocked: 'திறக்கப்பட்டது', unlockedDetail: 'திறக்கப்பட்டது · அர்த்தமுள்ள முன்னேற்றம்.', firstTitle: 'முதல் பாதுகாக்கப்பட்ட தொகுதி', firstDetail: 'உங்கள் முதல் கவன அமர்வை முடிக்கவும்.', fiveTitle: 'ஐந்து நிலையான தொகுதிகள்', fiveDetail: 'ஐந்து கவன அமர்வுகளை முடிக்கவும்.', hourTitle: 'ஒரு மணி நேர கவனம்', hourDetail: '60 நிமிட கவன நேரத்தைப் பாதுகாக்கவும்.', hoursUnit: 'மணி', minutesUnit: 'நிமி.',
  },
};

export function getRewardsCopy(locale: AppLocale): RewardsPageCopy {
  return COPY[locale] ?? COPY.en;
}

const ACHIEVEMENT_COPY: Record<AppLocale, Record<AchievementId, { title: string; detail: string }>> = {
  en: {
    first_focus_session: { title: 'First protected block', detail: 'Complete your first focus session.' },
    focus_sessions_5: { title: 'Five steady blocks', detail: 'Complete five focus sessions.' },
    focus_minutes_60: { title: 'One hour of focus', detail: 'Protect 60 minutes of focused time.' },
    focus_sessions_25: { title: 'Twenty-five steady blocks', detail: 'Complete 25 focus sessions.' },
    focus_minutes_600: { title: 'Ten hours of focus', detail: 'Protect 600 minutes of focused time.' },
    streak_3_days: { title: 'Three calm days', detail: 'Keep a three-day focus rhythm.' },
    streak_7_days: { title: 'One week of rhythm', detail: 'Keep a seven-day focus rhythm.' },
    first_goal_completed: { title: 'First goal completed', detail: 'Complete one saved goal.' },
  },
  si: {
    first_focus_session: { title: 'පළමු ආරක්ෂා කළ කොටස', detail: 'ඔබේ පළමු අවධානයේ සැසිය සම්පූර්ණ කරන්න.' },
    focus_sessions_5: { title: 'ස්ථාවර කොටස් පහක්', detail: 'අවධානයේ සැසි පහක් සම්පූර්ණ කරන්න.' },
    focus_minutes_60: { title: 'පැයක අවධානය', detail: 'මිනිත්තු 60ක අවධානය ආරක්ෂා කරන්න.' },
    focus_sessions_25: { title: 'ස්ථාවර කොටස් විසිපහක්', detail: 'අවධානයේ සැසි 25ක් සම්පූර්ණ කරන්න.' },
    focus_minutes_600: { title: 'පැය දහයක අවධානය', detail: 'මිනිත්තු 600ක අවධානය ආරක්ෂා කරන්න.' },
    streak_3_days: { title: 'සන්සුන් දින තුනක්', detail: 'දින තුනක අවධානයේ රිද්මයක් පවත්වා ගන්න.' },
    streak_7_days: { title: 'සතියක රිද්මය', detail: 'දින හතක අවධානයේ රිද්මයක් පවත්වා ගන්න.' },
    first_goal_completed: { title: 'පළමු ඉලක්කය සම්පූර්ණයි', detail: 'සුරකින ලද ඉලක්කයක් සම්පූර්ණ කරන්න.' },
  },
  ta: {
    first_focus_session: { title: 'முதல் பாதுகாக்கப்பட்ட தொகுதி', detail: 'உங்கள் முதல் கவன அமர்வை முடிக்கவும்.' },
    focus_sessions_5: { title: 'ஐந்து நிலையான தொகுதிகள்', detail: 'ஐந்து கவன அமர்வுகளை முடிக்கவும்.' },
    focus_minutes_60: { title: 'ஒரு மணி நேர கவனம்', detail: '60 நிமிட கவன நேரத்தைப் பாதுகாக்கவும்.' },
    focus_sessions_25: { title: 'இருபத்தைந்து நிலையான தொகுதிகள்', detail: '25 கவன அமர்வுகளை முடிக்கவும்.' },
    focus_minutes_600: { title: 'பத்து மணி நேர கவனம்', detail: '600 நிமிட கவன நேரத்தைப் பாதுகாக்கவும்.' },
    streak_3_days: { title: 'மூன்று அமைதியான நாட்கள்', detail: 'மூன்று நாள் கவன ஓட்டத்தைத் தொடரவும்.' },
    streak_7_days: { title: 'ஒருவார ஓட்டம்', detail: 'ஏழு நாள் கவன ஓட்டத்தைத் தொடரவும்.' },
    first_goal_completed: { title: 'முதல் இலக்கு முடிந்தது', detail: 'சேமித்த ஒரு இலக்கை முடிக்கவும்.' },
  },
};

export function getAchievementCopy(locale: AppLocale, achievementId: AchievementId) {
  return (ACHIEVEMENT_COPY[locale] ?? ACHIEVEMENT_COPY.en)[achievementId];
}
