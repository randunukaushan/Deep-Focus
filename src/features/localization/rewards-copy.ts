import type { AppLocale } from '@/features/settings/settings-storage';

export type RewardsPageCopy = {
  eyebrow: string; title: string; subtitle: string; loading: string; errorTitle: string; errorDetail: string;
  retry: string; tryAgain: string; yourMilestones: string; unlockedSummary: string; completedSession: string;
  completedSessions: string; focused: string; milestones: string; emptyLabel: string; emptyTitle: string;
  emptyDetail: string; startFocus: string; latestDetail: string; unlocked: string; unlockedDetail: string;
  firstTitle: string; firstDetail: string; fiveTitle: string; fiveDetail: string; hourTitle: string; hourDetail: string;
};

const COPY: Record<AppLocale, RewardsPageCopy> = {
  en: {
    eyebrow: 'REWARDS', title: 'Notice the work you protect.', subtitle: 'Small milestones for sustainable focus, without pressure.', loading: 'Loading rewards', errorTitle: 'Rewards could not be loaded.', errorDetail: 'Your saved session history has not been changed. Try again to reload rewards.', retry: 'Retry loading rewards', tryAgain: 'Try again', yourMilestones: 'YOUR MILESTONES', unlockedSummary: 'unlocked', completedSession: 'completed session', completedSessions: 'completed sessions', focused: 'focused', milestones: 'MILESTONES', emptyLabel: 'No rewards unlocked yet', emptyTitle: 'YOUR FIRST MILESTONE IS CLOSE', emptyDetail: 'Start one calm focus session to begin your progress.', startFocus: 'Start Focus Session', latestDetail: 'Milestones are based on completed sessions saved locally.', unlocked: 'Unlocked', unlockedDetail: 'Unlocked · a meaningful step forward.', firstTitle: 'First protected block', firstDetail: 'Complete your first focus session.', fiveTitle: 'Five steady blocks', fiveDetail: 'Complete five focus sessions.', hourTitle: 'One hour of focus', hourDetail: 'Protect 60 minutes of focused time.',
  },
  si: {
    eyebrow: 'තෑගි', title: 'ඔබ ආරක්ෂා කරන වැඩ හඳුනාගන්න.', subtitle: 'පීඩනයකින් තොර තිරසාර අවධානය සඳහා කුඩා සන්ධිස්ථාන.', loading: 'තෑගි පූරණය කරමින්', errorTitle: 'තෑගි පූරණය කළ නොහැක.', errorDetail: 'ඔබේ සුරකින ලද සැසි ඉතිහාසය වෙනස් කර නැත. තෑගි නැවත පූරණය කිරීමට උත්සාහ කරන්න.', retry: 'තෑගි නැවත පූරණය කරන්න', tryAgain: 'නැවත උත්සාහ කරන්න', yourMilestones: 'ඔබේ සන්ධිස්ථාන', unlockedSummary: 'විවෘතයි', completedSession: 'සම්පූර්ණ කළ සැසිය', completedSessions: 'සම්පූර්ණ කළ සැසි', focused: 'අවධානය යොමු කළ', milestones: 'සන්ධිස්ථාන', emptyLabel: 'තවම තෑගි විවෘත කර නැත', emptyTitle: 'ඔබේ පළමු සන්ධිස්ථානය ළඟයි', emptyDetail: 'ඔබේ ප්‍රගතිය ආරම්භ කිරීමට එක් සන්සුන් අවධානම් සැසියක් ආරම්භ කරන්න.', startFocus: 'අවධානම් සැසිය ආරම්භ කරන්න', latestDetail: 'සන්ධිස්ථාන දේශීයව සුරකින ලද සම්පූර්ණ කළ සැසි මත පදනම් වේ.', unlocked: 'විවෘතයි', unlockedDetail: 'විවෘතයි · අර්ථවත් ඉදිරි පියවරක්.', firstTitle: 'පළමු ආරක්ෂා කළ කොටස', firstDetail: 'ඔබේ පළමු අවධානම් සැසිය සම්පූර්ණ කරන්න.', fiveTitle: 'ස්ථාවර කොටස් පහක්', fiveDetail: 'අවධානම් සැසි පහක් සම්පූර්ණ කරන්න.', hourTitle: 'පැයක අවධානය', hourDetail: 'මිනිත්තු 60ක අවධානය ආරක්ෂා කරන්න.',
  },
  ta: {
    eyebrow: 'வெகுமதிகள்', title: 'நீங்கள் பாதுகாக்கும் பணியை கவனியுங்கள்.', subtitle: 'அழுத்தமில்லாத நிலையான கவனத்திற்கான சிறிய முன்னேற்றங்கள்.', loading: 'வெகுமதிகள் ஏற்றப்படுகின்றன', errorTitle: 'வெகுமதிகளை ஏற்ற முடியவில்லை.', errorDetail: 'சேமித்த அமர்வு வரலாறு மாற்றப்படவில்லை. வெகுமதிகளை மீண்டும் ஏற்ற முயற்சிக்கவும்.', retry: 'வெகுமதிகளை மீண்டும் ஏற்றவும்', tryAgain: 'மீண்டும் முயற்சிக்கவும்', yourMilestones: 'உங்கள் முன்னேற்றங்கள்', unlockedSummary: 'திறக்கப்பட்டவை', completedSession: 'முடிக்கப்பட்ட அமர்வு', completedSessions: 'முடிக்கப்பட்ட அமர்வுகள்', focused: 'கவனம் செலுத்தப்பட்டது', milestones: 'முன்னேற்றங்கள்', emptyLabel: 'வெகுமதிகள் இன்னும் திறக்கப்படவில்லை', emptyTitle: 'உங்கள் முதல் முன்னேற்றம் அருகில் உள்ளது', emptyDetail: 'உங்கள் முன்னேற்றத்தைத் தொடங்க ஒரு அமைதியான கவன அமர்வைத் தொடங்கவும்.', startFocus: 'கவன அமர்வைத் தொடங்கவும்', latestDetail: 'முன்னேற்றங்கள் உள்ளூரில் சேமிக்கப்பட்ட முடிக்கப்பட்ட அமர்வுகளை அடிப்படையாகக் கொண்டவை.', unlocked: 'திறக்கப்பட்டது', unlockedDetail: 'திறக்கப்பட்டது · அர்த்தமுள்ள முன்னேற்றம்.', firstTitle: 'முதல் பாதுகாக்கப்பட்ட தொகுதி', firstDetail: 'உங்கள் முதல் கவன அமர்வை முடிக்கவும்.', fiveTitle: 'ஐந்து நிலையான தொகுதிகள்', fiveDetail: 'ஐந்து கவன அமர்வுகளை முடிக்கவும்.', hourTitle: 'ஒரு மணி நேர கவனம்', hourDetail: '60 நிமிட கவன நேரத்தைப் பாதுகாக்கவும்.',
  },
};

export function getRewardsCopy(locale: AppLocale): RewardsPageCopy {
  return COPY[locale] ?? COPY.en;
}
