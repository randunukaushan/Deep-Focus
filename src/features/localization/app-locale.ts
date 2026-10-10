import type { AppLocale } from '@/features/settings/settings-storage';

export type TaskDetailCopy = {
  back: string; loadErrorTitle: string; loadErrorDetail: string; retryLoad: string; unavailableTitle: string; unavailableDetail: string;
  eyebrow: string; editTitle: string; descriptionPlaceholder: string; dueDateLabel: string; blankDateHint: string; priorityLabel: string; goalLabel: string;
  loadingGoals: string; goalsLoadError: string; retryGoals: string; noGoal: string; createGoalFirst: string; dueDatePrefix: string; priorityPrefix: string;
  archivedStatus: string; completedStatus: string; cancelledStatus: string; readyStatus: string; pendingSave: string; reload: string; deleteTitle: string;
  deleteDetail: string; deleteConfirm: string; keepTask: string; saveDetails: string; cancelEditing: string; editDetails: string; complete: string;
  focus: string; restore: string; archive: string; delete: string; noPriority: string; low: string; medium: string; high: string;
};

export type SettingsPageCopy = {
  back: string; eyebrow: string; title: string; subtitle: string; loading: string; loadErrorTitle: string; loadErrorDetail: string; retry: string;
  focusSection: string; focusDuration: string; focusHint: string; saving: string; breakDuration: string; breakHint: string; saveError: string;
  appearanceSection: string; appearance: string; systemTheme: string; reducedMotion: string; reducedMotionDetail: string; languageDetailSuffix: string;
  notificationsSection: string; notifications: string; notificationsDetail: string; sound: string; soundDetail: string; privacySection: string;
  localFirst: string; localFirstDetail: string; account: string; accountDetail: string;
};

export type OnboardingCopy = {
  intro: {
    back: string; title: string; subtitle: string; stepOneTitle: string; stepOneDetail: string; stepTwoTitle: string; stepTwoDetail: string;
    stepThreeTitle: string; stepThreeDetail: string; start: string; skip: string; privacy: string;
  };
  assessment: {
    backOnboarding: string; previous: string; eyebrow: string; title: string; subtitle: string; loading: string; error: string; choices: string;
    viewProfile: string; next: string; retry: string; skip: string; privacy: string;
  };
  profile: {
    back: string; eyebrow: string; title: string; noAnswers: string; noAnswersDetail: string; start: string; continueDefaults: string;
    subtitle: string; shared: string; sharedDetail: string; suggestions: string; suggestionDetail: string; saved: string; savedDetail: string;
    saving: string; saveError: string; retry: string; review: string; reviewDetail: string; applied: string; applyError: string; apply: string;
    appliedButton: string; startFocus: string; useDefaults: string;
  };
};

export type AppLocaleCopy = {
  tabs: {
    home: string;
    plan: string;
    focus: string;
    progress: string;
    profile: string;
  };
  settings: {
    language: string;
    languageHint: string;
  };
  welcome: {
    eyebrow: string;
    title: string;
    subtitle: string;
    promiseSessions: string;
    promisePrivacy: string;
    promisePace: string;
    createAccount: string;
    signIn: string;
  };
  signIn: {
    back: string;
    title: string;
    subtitle: string;
    email: string;
    password: string;
    passwordError: string;
    emailPlaceholder: string;
    emailError: string;
    passwordPlaceholder: string;
    showPassword: string;
    hidePassword: string;
    signIn: string;
    signingIn: string;
    google: string;
    apple: string;
    forgotPassword: string;
    newToApp: string;
    createAccount: string;
    privacy: string;
  };
  signUp: {
    back: string;
    title: string;
    subtitle: string;
    email: string;
    password: string;
    confirmPassword: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    confirmPlaceholder: string;
    showPassword: string;
    hidePassword: string;
    emailError: string;
    passwordError: string;
    confirmationError: string;
    createAccount: string;
    creatingAccount: string;
    google: string;
    existingAccount: string;
    signIn: string;
    privacy: string;
  };
  recovery: {
    backSignIn: string;
    backSignUp: string;
    resetTitle: string;
    resetSubtitle: string;
    accountEmail: string;
    emailPlaceholder: string;
    emailError: string;
    sendLink: string;
    sending: string;
    backToSignIn: string;
    privacy: string;
    verifyTitle: string;
    verifySubtitle: string;
    waitingTitle: string;
    waitingBody: string;
    resend: string;
    verifiedPrivacy: string;
    newPasswordTitle: string;
    newPasswordSubtitle: string;
    newPassword: string;
    confirmNewPassword: string;
    mismatch: string;
    savePassword: string;
    saving: string;
    resetSent: string;
    recoveryError: string;
  };
  home: {
    settings: string;
    brandTagline: string;
    morning: string;
    afternoon: string;
    evening: string;
    calmMorning: string;
    calmNight: string;
    calmDay: string;
    heroKicker: string;
    heroMeta: string;
    heroTitle: string;
    heroCopy: string;
    startFocus: string;
    startFocusAccessibility: string;
    suggested: string;
    flexible: string;
    local: string;
    private: string;
    pausedKicker: string;
    focusSession: string;
    remaining: string;
    continue: string;
    focusSoFar: string;
    noFocus: string;
    focusTime: string;
    blocks: string;
    quickActions: string;
    keepDayClear: string;
    tasks: string;
    tasksDetail: string;
    goals: string;
    goalsDetail: string;
    plan: string;
    planDetail: string;
  };
  profile: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cardLabel: string;
    cardTitle: string;
    cardDetail: string;
    review: string;
    focusSection: string;
    history: string;
    historyDetail: string;
    goals: string;
    goalsDetail: string;
    tasks: string;
    tasksDetail: string;
    resources: string;
    resourcesDetail: string;
    recovery: string;
    recoveryDetail: string;
    preferences: string;
    settings: string;
    settingsDetail: string;
    signedIn: string;
    offlineAccount: string;
    signOut: string;
    signingOut: string;
    signOutDetail: string;
    signIn: string;
    signInDetail: string;
    privateNote: string;
    syncStatus: string;
    syncStatusLoading: string;
    syncStatusLocalDetail: string;
    syncStatusPendingDetail: string;
    syncStatusUnavailable: string;
  };
  planner: {
    back: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    timeAvailable: string;
    availableMinutes: string;
    minutes: string;
    minError: string;
    numberError: string;
    breakHint: string;
    chooseTasks: string;
    loading: string;
    loadError: string;
    retry: string;
    empty: string;
    addTask: string;
    selected: string;
    notSelected: string;
    suggest: string;
    suggestion: string;
    included: string;
    startingPoint: string;
    blockDuration: string;
    moveEarlier: string;
    moveEarlierSuffix: string;
    moveLater: string;
    moveLaterSuffix: string;
    start: string;
    proposalNote: string;
    confirmed: string;
    confirm: string;
    adjust: string;
    saved: string;
    saveError: string;
  };
  resourcesPage: {
    title: string;
    subtitle: string;
    add: string;
    titleInput: string;
    referenceInput: string;
    typeReference: string;
    typeLink: string;
    save: string;
    saving: string;
    loading: string;
    empty: string;
    loadError: string;
    saveError: string;
    retry: string;
    missing: string;
    markMissing: string;
    saved: string;
    taskSection: string;
    taskSectionDetail: string;
    taskEmpty: string;
    link: string;
    linked: string;
    linkChangedError: string;
    linkUnavailableError: string;
  };
  historyPage: {
    back: string;
    title: string;
    subtitle: string;
    loading: string;
    loadErrorTitle: string;
    loadErrorDetail: string;
    retry: string;
    noSessionsLabel: string;
    noSessionsTitle: string;
    noSessionsDetail: string;
    startFocus: string;
    focusTime: string;
    completed: string;
    allSessions: string;
    completedFilter: string;
    cancelledFilter: string;
    noMatchingTitle: string;
    noMatchingDetail: string;
    recent: string;
    openDetailsHint: string;
    focusSession: string;
    cancelled: string;
    completedStatus: string;
    focused: string;
    of: string;
    detailLoading: string;
    detailLoadErrorTitle: string;
    detailLoadErrorDetail: string;
    detailRetry: string;
    detailEyebrow: string;
    detailCompletedTitle: string;
    detailCancelledTitle: string;
    detailSubtitle: string;
    detailUnavailableTitle: string;
    detailUnavailableDetail: string;
    focusedLabel: string;
    plannedLabel: string;
    progressLabel: string;
    progressAccessibility: string;
  };
  taskDetail?: TaskDetailCopy;
  settingsPage?: SettingsPageCopy;
  onboarding?: OnboardingCopy;
  focus: {
    eyebrow: string;
    title: string;
    subtitle: string;
    sessionPaused: string;
    sessionActive: string;
    sessionReady: string;
    sessionProgress: string;
    resume: string;
    returnToSession: string;
    recommendedStart: string;
    calmBlock: string;
    chooseTask: string;
    start: string;
    flexibleTiming: string;
    chooseDuration: string;
    durationHint: string;
    configure: string;
    savedLocally: string;
    setupTitle: string;
    setupSubtitle: string;
    taskOptional: string;
    taskPlaceholder: string;
    linkedTask: string;
    taskLoading: string;
    taskUnavailable: string;
    duration: string;
    custom: string;
    minutes: string;
    settingsError: string;
    durationError: string;
    startSession: string;
    backHome: string;
    summaryEyebrow: string;
    sessionComplete: string;
    sessionEnded: string;
    focusedWork: string;
    endedBeforePlan: string;
    focusSummary: string;
    focusTime: string;
    planned: string;
    status: string;
    completed: string;
    cancelled: string;
    task: string;
    anotherSession: string;
  };
  plan: {
    eyebrow: string;
    title: string;
    subtitle: string;
    tasks: string;
    tasksDetail: string;
    goals: string;
    goalsDetail: string;
  };
  goals: {
    eyebrow: string;
    title: string;
    subtitle: string;
    create: string;
    newWeekly: string;
    titleLabel: string;
    titlePlaceholder: string;
    sessions: string;
    focusMinutes: string;
    target: string;
    save: string;
    cancel: string;
    yourGoals: string;
    emptyLabel: string;
    empty: string;
    loading: string;
    loadErrorTitle: string;
    loadErrorBody: string;
    retry: string;
    sessionError: string;
    focusError: string;
    saveError: string;
    back: string;
  };
  tasks: {
    eyebrow: string;
    title: string;
    subtitle: string;
    add: string;
    newTask: string;
    titleLabel: string;
    placeholder: string;
    save: string;
    cancel: string;
    upNext: string;
    completed: string;
    archived: string;
    showArchived: string;
    hideArchived: string;
    loading: string;
    loadError: string;
    retry: string;
    saving: string;
    saveError: string;
    noActive: string;
    cleared: string;
    archivedState: string;
    completedState: string;
    ready: string;
    complete: string;
  };
};

type BaseAppLocaleCopy = Omit<AppLocaleCopy, 'signIn' | 'recovery'> & {
  signIn: Omit<AppLocaleCopy['signIn'], 'emailError' | 'passwordError'>;
  recovery: Omit<AppLocaleCopy['recovery'], 'resetSent' | 'recoveryError'>;
};

const SIGN_IN_VALIDATION_COPY: Record<AppLocale, Pick<AppLocaleCopy['signIn'], 'emailError' | 'passwordError'>> = {
  en: { emailError: 'Enter your email address.', passwordError: 'Enter your password.' },
  si: { emailError: 'ඔබේ විද්‍යුත් තැපැල් ලිපිනය ඇතුළත් කරන්න.', passwordError: 'ඔබේ මුරපදය ඇතුළත් කරන්න.' },
  ta: { emailError: 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்.', passwordError: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்.' },
};

const RECOVERY_OUTCOME_COPY: Record<AppLocale, Pick<AppLocaleCopy['recovery'], 'resetSent' | 'recoveryError'>> = {
  en: { resetSent: 'If an account uses this address, a reset link has been sent.', recoveryError: 'We could not complete that request. Please try again.' },
  si: { resetSent: 'මෙම ලිපිනයට ගිණුමක් තිබේ නම්, නැවත සකස් කිරීමේ සබැඳිය යවා ඇත.', recoveryError: 'එම ඉල්ලීම සම්පූර්ණ කළ නොහැකි විය. නැවත උත්සාහ කරන්න.' },
  ta: { resetSent: 'இந்த முகவரியில் கணக்கு இருந்தால், மீட்டமைப்பு இணைப்பு அனுப்பப்பட்டுள்ளது.', recoveryError: 'இந்தக் கோரிக்கையை முடிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' },
};

const COPY: Record<AppLocale, BaseAppLocaleCopy> = {
  en: {
    tabs: { home: 'Home', plan: 'Plan', focus: 'Focus', progress: 'Progress', profile: 'Profile' },
    settings: { language: 'App language', languageHint: 'Choose a saved interface preference.' },
    historyPage: { back: 'Back to Progress', title: 'Session History', subtitle: 'A quiet record of the time you chose to protect.', loading: 'Loading session history', loadErrorTitle: 'Session history could not be loaded.', loadErrorDetail: 'Your saved sessions have not been changed. Try again to reload them.', retry: 'Retry loading session history', noSessionsLabel: 'No focus sessions recorded yet', noSessionsTitle: 'NO SESSIONS YET', noSessionsDetail: 'Completed focus sessions will appear here.', startFocus: 'Start Focus Session', focusTime: 'FOCUS TIME', completed: 'COMPLETED', allSessions: 'All sessions', completedFilter: 'Completed', cancelledFilter: 'Cancelled', noMatchingTitle: 'NO MATCHING SESSIONS', noMatchingDetail: 'Try another filter to review your focus history.', recent: 'RECENT SESSIONS', openDetailsHint: 'Open session details', focusSession: 'Focus session', cancelled: 'CANCELLED', completedStatus: 'COMPLETED', focused: 'focused', of: 'of', detailLoading: 'Loading session details', detailLoadErrorTitle: 'Session details could not be loaded.', detailLoadErrorDetail: 'Your saved history has not been changed. Try again to reload this session.', detailRetry: 'Retry loading session', detailEyebrow: 'SESSION DETAIL', detailCompletedTitle: 'A block worth remembering.', detailCancelledTitle: 'A block completed your way.', detailSubtitle: 'A quiet record of one protected focus block.', detailUnavailableTitle: 'Session unavailable', detailUnavailableDetail: 'This session could not be found in local history.', focusedLabel: 'FOCUSED', plannedLabel: 'PLANNED', progressLabel: 'PROGRESS', progressAccessibility: 'percent of planned focus completed' },
    welcome: { eyebrow: 'DEEP FOCUS', title: 'Focus on what matters.', subtitle: 'A calm space to protect your attention, complete meaningful work, and recover well.', promiseSessions: 'Reliable focus sessions', promisePrivacy: 'Private, local-first progress', promisePace: 'Sustainable pace, no pressure', createAccount: 'Create Account', signIn: 'Sign In' },
    signIn: { back: 'Welcome', title: 'Welcome back.', subtitle: 'Sign in to continue protecting your attention and keep your progress together.', email: 'EMAIL', password: 'PASSWORD', emailPlaceholder: 'you@example.com', passwordPlaceholder: 'Your password', showPassword: 'Show password', hidePassword: 'Hide password', signIn: 'Sign In', signingIn: 'Signing In…', google: 'Continue with Google', apple: 'Continue with Apple', forgotPassword: 'Forgot Password', newToApp: 'New to Deep Focus?', createAccount: 'Create account', privacy: 'Your focus history stays private and under your control.' },
    signUp: { back: 'Sign In', title: 'Create your account.', subtitle: 'Keep your focus practice available across supported devices when account sync is ready.', email: 'EMAIL', password: 'PASSWORD', confirmPassword: 'CONFIRM PASSWORD', emailPlaceholder: 'you@example.com', passwordPlaceholder: 'Choose a password', confirmPlaceholder: 'Repeat your password', showPassword: 'Show password', hidePassword: 'Hide password', emailError: 'Enter your email address.', passwordError: 'Enter a password.', confirmationError: 'Passwords must match.', createAccount: 'Create Account', creatingAccount: 'Creating Account…', google: 'Create account with Google', existingAccount: 'Already have an account?', signIn: 'Sign In', privacy: 'We will only request the account details needed for secure access.' },
    recovery: { backSignIn: 'Sign In', backSignUp: 'Sign Up', resetTitle: 'Reset your password.', resetSubtitle: 'Enter the email connected to your account and we’ll help you get back to your focus practice.', accountEmail: 'ACCOUNT EMAIL', emailPlaceholder: 'you@example.com', emailError: 'Enter your email address.', sendLink: 'Send Reset Link', sending: 'Sending…', backToSignIn: 'Back to Sign In', privacy: 'We won’t reveal whether an email is registered.', verifyTitle: 'Check your inbox.', verifySubtitle: 'Email verification helps keep your account secure and your focus data connected to the right person.', waitingTitle: 'Verification is waiting.', waitingBody: 'Open the message from Deep Focus and follow its secure verification link. You can return here when you are ready.', resend: 'Resend Verification Email', verifiedPrivacy: 'Sign-in will be available after your email address is verified.', newPasswordTitle: 'Choose a new password.', newPasswordSubtitle: 'Use the secure recovery link sent to your email, then choose your new password.', newPassword: 'New password', confirmNewPassword: 'Confirm new password', mismatch: 'Passwords must match.', savePassword: 'Save New Password', saving: 'Saving…' },
    home: { settings: 'Open settings', brandTagline: 'Focus on what matters.', morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening', calmMorning: 'A calmer start to the day.', calmNight: 'Make space for a quieter evening.', calmDay: 'Make room for the work that matters today.', heroKicker: 'YOUR NEXT FOCUS BLOCK', heroMeta: '25 MIN · RECOMMENDED', heroTitle: 'A calm 25-minute start.', heroCopy: 'Choose one meaningful task. We will take care of the rest.', startFocus: 'Start Focus Session', startFocusAccessibility: 'Start a 25 minute focus session', suggested: 'Suggested', flexible: 'Flexible', local: 'Local', private: 'Private', pausedKicker: 'FOCUS SESSION PAUSED', focusSession: 'Focus session', remaining: 'remaining', continue: 'Continue', focusSoFar: 'YOUR FOCUS SO FAR', noFocus: 'No focus time yet.', focusTime: 'FOCUS TIME', blocks: 'BLOCKS', quickActions: 'QUICK ACTIONS', keepDayClear: 'Keep your day clear.', tasks: 'Tasks', tasksDetail: 'Choose what matters next', goals: 'Goals', goalsDetail: 'Keep your direction clear', plan: 'Plan My Day', planDetail: 'Create a calm starting point' },
    focus: { eyebrow: 'FOCUS', title: 'Make space for one thing.', subtitle: 'Choose a calm focus block and begin when you are ready.', sessionPaused: 'SESSION PAUSED', sessionActive: 'SESSION ACTIVE', sessionReady: 'Your session is ready to continue.', sessionProgress: 'Your focus session is in progress.', resume: 'Resume Session', returnToSession: 'Return to Session', recommendedStart: 'RECOMMENDED START', calmBlock: 'A calm 25-minute block.', chooseTask: 'Pick one meaningful task and protect the time to work on it.', start: 'Start Focus Session', flexibleTiming: 'FLEXIBLE TIMING', chooseDuration: 'Choose your own duration.', durationHint: 'Set any focus block between 5 and 180 minutes.', configure: 'Configure', savedLocally: 'Your session stays saved locally if the app is interrupted.', setupTitle: 'Session Setup', setupSubtitle: 'Configure your focus session before you begin.', taskOptional: 'Task name (optional)', taskPlaceholder: 'What would you like to focus on?', linkedTask: 'Linked task', taskLoading: 'Loading your task…', taskUnavailable: 'That task is unavailable. Your task list has not been changed; return to Tasks and choose an active task.', duration: 'Focus duration', custom: 'Custom', minutes: 'minutes', settingsError: 'Your saved focus default could not be read. Choose a duration before starting.', durationError: 'Session duration must be between 5 and 180 minutes.', startSession: 'Start Focus Session', backHome: 'Back to Home', summaryEyebrow: 'SESSION SUMMARY', sessionComplete: 'Session complete.', sessionEnded: 'Session ended.', focusedWork: 'You made space for focused work.', endedBeforePlan: 'Your session ended before the planned focus period.', focusSummary: 'FOCUS SUMMARY', focusTime: 'FOCUS TIME', planned: 'PLANNED', status: 'STATUS', completed: 'COMPLETED', cancelled: 'CANCELLED', task: 'Task:', anotherSession: 'Start Another Session' },
    plan: { eyebrow: 'PLAN', title: 'Make room for what matters.', subtitle: 'Choose a task or goal to work on next.', tasks: 'Tasks', tasksDetail: 'Keep your next steps clear.', goals: 'Goals', goalsDetail: 'Review the goals you chose.' },
    goals: { eyebrow: 'GOALS', title: 'Keep your direction clear.', subtitle: 'Set one measurable intention. Focus time and completed sessions count toward the goal you chose.', create: 'Create a goal', newWeekly: 'NEW WEEKLY GOAL', titleLabel: 'Goal title', titlePlaceholder: 'What do you want to achieve?', sessions: 'Sessions', focusMinutes: 'Focus minutes', target: 'Target', save: 'Save goal', cancel: 'Cancel', yourGoals: 'YOUR GOALS', emptyLabel: 'No goals yet', empty: 'Create a simple goal when you are ready.', loading: 'Loading goals', loadErrorTitle: 'Your goals could not be loaded.', loadErrorBody: 'Your saved goals have not been changed. Try again to reload goals and progress.', retry: 'Retry loading goals', sessionError: 'Enter a whole number of sessions.', focusError: 'Enter a valid focus-time target in minutes.', saveError: 'This goal could not be saved. Your existing goals were kept; try again.', back: 'Back to Goals' },
    tasks: { eyebrow: 'TASKS', title: 'Choose what matters next.', subtitle: 'Keep your next steps clear and ready for focus.', add: 'Add a task', newTask: 'NEW TASK', titleLabel: 'Task title', placeholder: 'What needs your attention?', save: 'Save task', cancel: 'Cancel', upNext: 'UP NEXT', completed: 'COMPLETED', archived: 'ARCHIVED', showArchived: 'View archived tasks', hideArchived: 'Hide archived tasks', loading: 'Loading tasks…', loadError: 'Your tasks could not be loaded. Your saved data has not been reset.', retry: 'Retry loading tasks', saving: 'Saving changes…', saveError: 'Your changes could not be saved. Your task list and draft were kept. Try the action again.', noActive: 'No active tasks. Add one whenever you are ready.', cleared: 'You have cleared your task list.', archivedState: 'Archived', completedState: 'Completed', ready: 'Ready for focus', complete: 'Complete' },
    profile: { eyebrow: 'PROFILE', title: 'Make focus work for you.', subtitle: 'Keep your preferences and progress in one calm place.', cardLabel: 'YOUR PROFILE', cardTitle: 'A more personal focus practice.', cardDetail: 'Review your focus preferences and the profile created from your onboarding answers.', review: 'Review profile', focusSection: 'YOUR FOCUS', history: 'Focus history', historyDetail: 'See the time you chose to protect.', goals: 'Goals', goalsDetail: 'Keep meaningful progress visible.', tasks: 'Tasks', tasksDetail: 'Choose what deserves your attention.', resources: 'Resources', resourcesDetail: 'Keep private references and links close to your work.', recovery: 'Session recovery', recoveryDetail: 'Check for an interrupted focus session.', preferences: 'PREFERENCES', settings: 'Settings', settingsDetail: 'Manage supported app preferences.', signedIn: 'Signed in', offlineAccount: 'This device keeps a separate offline data space for this account.', signOut: 'Sign Out', signingOut: 'Signing Out…', signOutDetail: 'This will not merge or delete this device’s local-only data.', signIn: 'Sign In', signInDetail: 'Sign in to access your account on this device.', privateNote: 'Your account’s focus data remains on this device until secure synchronization is implemented and verified.', syncStatus: 'DATA SYNC STATUS', syncStatusLoading: 'Checking local pending changes…', syncStatusLocalDetail: 'Secure account synchronization is not active yet. Your data remains on this device.', syncStatusPendingDetail: '{count} local change(s) are waiting for secure synchronization. Your data is kept on this device.', syncStatusUnavailable: 'Local sync status could not be read. Your saved data was not changed.' },
    planner: { back: 'Home', eyebrow: 'PLAN MY DAY', title: 'Start with what matters.', subtitle: 'Choose the tasks and time you have. We will suggest a simple starting point for your day.', timeAvailable: 'TIME AVAILABLE', availableMinutes: 'Available minutes', minutes: 'minutes', minError: 'Enter at least 25 minutes to plan.', numberError: 'Enter a smaller whole number of minutes.', breakHint: 'Each suggestion leaves space for a short break.', chooseTasks: 'CHOOSE TASKS', loading: 'Loading your tasks…', loadError: 'We could not load your tasks. Your saved tasks have not been changed.', retry: 'Retry loading tasks', empty: 'Add a task first, then come back to build a plan.', addTask: 'Add a task', selected: 'selected', notSelected: 'not selected', suggest: 'Suggest a plan', suggestion: 'YOUR SUGGESTION', included: 'Included in your suggestion', startingPoint: 'A clear starting point.', blockDuration: '25 min focus · 5 min break', moveEarlier: 'Move', moveEarlierSuffix: 'earlier', moveLater: 'Move', moveLaterSuffix: 'later', start: 'Start', proposalNote: 'This is a proposal only. Your tasks and schedule have not been changed.', confirmed: 'You confirmed this exact selection. Starting a task still uses the normal focus flow.', confirm: 'Confirm this proposal', adjust: 'Adjust selection', saved: 'This confirmed plan is saved on this device.', saveError: 'This plan could not be saved. Your tasks were not changed; try confirming again.' },
    resourcesPage: { title: 'Resources', subtitle: 'Save private references and HTTPS links on this device. Nothing is uploaded.', add: 'Add a resource', titleInput: 'Title', referenceInput: 'Reference or HTTPS link', typeReference: 'Reference', typeLink: 'HTTPS link', save: 'Save resource', saving: 'Saving…', loading: 'Loading local resources…', empty: 'No local resources yet.', loadError: 'Resources could not be loaded. Nothing was changed.', saveError: 'The resource could not be saved or updated. Nothing else was changed.', retry: 'Retry', missing: 'Missing', markMissing: 'Mark missing', saved: 'Saved locally.', taskSection: 'Resources', taskSectionDetail: 'Keep selected local references with this task. Nothing is uploaded.', taskEmpty: 'No local resources yet. Add one from Profile → Resources.', link: 'Link', linked: 'Linked', linkChangedError: 'This resource changed or is unavailable. Reload the task.', linkUnavailableError: 'The resource link could not be changed.' },
    taskDetail: { back: 'Back to Tasks', loadErrorTitle: 'This task could not be loaded.', loadErrorDetail: 'Your saved tasks have not been changed. Try again to reload this task.', retryLoad: 'Retry loading task', unavailableTitle: 'Task unavailable', unavailableDetail: 'This task could not be found on this device.', eyebrow: 'TASK DETAIL', editTitle: 'Edit task title', descriptionPlaceholder: 'Add a note (optional)', dueDateLabel: 'Due date (UTC calendar date, optional)', blankDateHint: 'A blank date means no deadline. The date stays consistent across devices.', priorityLabel: 'Priority (optional)', goalLabel: 'Goal (optional)', loadingGoals: 'Loading your goals…', goalsLoadError: 'Your goals could not be loaded. The current goal link stays unchanged; retry to choose a different goal.', retryGoals: 'Retry loading goals', noGoal: 'No goal', createGoalFirst: 'Create a goal first to link this task.', dueDatePrefix: 'Due', priorityPrefix: 'Priority', archivedStatus: 'Archived. This task is hidden from active lists; its focus history is preserved.', completedStatus: 'Completed. You made space for this.', cancelledStatus: 'This task was cancelled.', readyStatus: 'Ready to become your next focus block.', pendingSave: 'This task could not be saved. It is still pending; try again.', reload: 'Reload task', deleteTitle: 'Delete this task?', deleteDetail: 'The task will be removed. Focus sessions remain in your history, with the task name kept for context.', deleteConfirm: 'Delete task and keep history', keepTask: 'Keep task', saveDetails: 'Save task details', cancelEditing: 'Cancel editing', editDetails: 'Edit task details', complete: 'Complete task', focus: 'Focus on this task', restore: 'Restore task', archive: 'Archive task', delete: 'Delete task', noPriority: 'No priority', low: 'Low', medium: 'Medium', high: 'High' },
    settingsPage: { back: 'Profile', eyebrow: 'SETTINGS', title: 'Set a calmer default.', subtitle: 'Choose how Deep Focus should support your attention.', loading: 'Loading your saved settings…', loadErrorTitle: 'Your settings are unchanged.', loadErrorDetail: 'Saved preferences could not be read. No default was saved over them.', retry: 'Try again', focusSection: 'FOCUS', focusDuration: 'Default focus duration', focusHint: 'Used for new focus sessions. Changes are confirmed after they save.', saving: 'Saving your choice…', breakDuration: 'Default break duration', breakHint: 'Used for future breaks. Changes are confirmed after they save.', saveError: 'Your change wasn’t saved. Your previous choice is still selected. Try again.', appearanceSection: 'APPEARANCE & ACCESSIBILITY', appearance: 'Appearance', systemTheme: 'System · follows your device theme', reducedMotion: 'Reduced motion', reducedMotionDetail: 'Follows your device accessibility preference', languageDetailSuffix: 'Full translation and accessibility review are still pending.', notificationsSection: 'NOTIFICATIONS & FEEDBACK', notifications: 'Notifications', notificationsDetail: 'Notification scheduling is not configured yet', sound: 'Sound & haptics', soundDetail: 'Feedback controls will be available with session feedback', privacySection: 'PRIVACY & ACCOUNT', localFirst: 'Local-first data', localFirstDetail: 'Your focus sessions remain on this device while sync is not configured.', account: 'Account', accountDetail: 'Sign in when account access is available' },
    onboarding: { intro: { back: 'Welcome', title: 'Build a focus practice that fits.', subtitle: 'A few thoughtful questions help Deep Focus make the experience more useful without adding pressure.', stepOneTitle: 'Share what helps', stepOneDetail: 'Tell us about your preferred pace and focus environment.', stepTwoTitle: 'Shape your setup', stepTwoDetail: 'Review the suggestions before anything is applied.', stepThreeTitle: 'Start gently', stepThreeDetail: 'Begin with a calm, reliable session when you are ready.', start: 'Start Personal Assessment', skip: 'Skip for now', privacy: 'You stay in control. Your answers are suggestions, not commitments.' }, assessment: { backOnboarding: 'Onboarding', previous: 'Previous question', eyebrow: 'PERSONAL ASSESSMENT', title: 'A few questions, at your pace.', subtitle: 'There are no wrong answers. Choose what feels closest, or go back and change it.', loading: 'Loading your saved answers…', error: 'We could not save your answer. Your choice is still shown. Retry when ready.', choices: 'Answer choices', viewProfile: 'View My Profile', next: 'Next question', retry: 'Retry saving answer', skip: 'Skip assessment', privacy: 'Your answers are used to prepare suggestions for your review.' }, profile: { back: 'Assessment', eyebrow: 'YOUR PROFILE', title: 'Your starting point.', noAnswers: 'Your preferences have not been collected.', noAnswersDetail: 'You can start the optional assessment, or continue with the app’s standard settings.', start: 'Start Personal Assessment', continueDefaults: 'Continue with defaults', subtitle: 'These are the choices you shared for this assessment. They are not long-term conclusions.', shared: 'WHAT YOU SHARED', sharedDetail: 'Your choice for this assessment', suggestions: 'SUGGESTIONS TO REVIEW', suggestionDetail: 'Optional starting idea; nothing is applied', saved: 'Saved on this device', savedDetail: 'Your answers are saved in the local app database so this flow can be restored. Suggestions are only applied after you confirm.', saving: 'Saving your latest choice…', saveError: 'Your latest choice could not be saved. The saved version is kept. You can retry.', retry: 'Retry saving answer', review: 'Review before applying', reviewDetail: 'This would set future focus blocks to {focus} minutes and breaks to {break} minutes. It will not change existing tasks or a running session.', applied: 'Applied to your local settings.', applyError: 'Could not apply the suggestion. Your previous settings are unchanged. Try again.', apply: 'Apply suggestions to my settings', appliedButton: 'Settings applied', startFocus: 'Start a Focus Session', useDefaults: 'Use the app’s standard settings' } },
  },
  si: {
    tabs: { home: 'මුල් පිටුව', plan: 'සැලැස්ම', focus: 'අවධානය', progress: 'ප්‍රගතිය', profile: 'පැතිකඩ' },
    settings: { language: 'යෙදුමේ භාෂාව', languageHint: 'සුරකින ලද අතුරුමුහුණත් භාෂාව තෝරන්න.' },
    historyPage: { back: 'ප්‍රගතියට ආපසු', title: 'සැසි ඉතිහාසය', subtitle: 'ඔබ ආරක්ෂා කිරීමට තෝරාගත් කාලය පිළිබඳ සන්සුන් සටහනක්.', loading: 'සැසි ඉතිහාසය පූරණය කරමින්', loadErrorTitle: 'සැසි ඉතිහාසය පූරණය කළ නොහැක.', loadErrorDetail: 'ඔබේ සුරකින ලද සැසි වෙනස් කර නැත. ඒවා නැවත පූරණය කිරීමට උත්සාහ කරන්න.', retry: 'සැසි ඉතිහාසය නැවත පූරණය කරන්න', noSessionsLabel: 'තවම අවධානම් සැසි සටහන් කර නැත', noSessionsTitle: 'තවම සැසි නැත', noSessionsDetail: 'සම්පූර්ණ කළ අවධානම් සැසි මෙහි පෙන්වනු ඇත.', startFocus: 'අවධානම් සැසිය ආරම්භ කරන්න', focusTime: 'අවධානම් කාලය', completed: 'සම්පූර්ණ කළ', allSessions: 'සියලු සැසි', completedFilter: 'සම්පූර්ණ කළ', cancelledFilter: 'අවලංගු කළ', noMatchingTitle: 'ගැළපෙන සැසි නැත', noMatchingDetail: 'ඔබේ අවධානම් ඉතිහාසය බැලීමට වෙනත් පෙරහනක් තෝරන්න.', recent: 'මෑත සැසි', openDetailsHint: 'සැසි විස්තර විවෘත කරන්න', focusSession: 'අවධානම් සැසිය', cancelled: 'අවලංගු කළ', completedStatus: 'සම්පූර්ණ කළ', focused: 'අවධානය යොමු කළ', of: 'න්', detailLoading: 'සැසි විස්තර පූරණය කරමින්', detailLoadErrorTitle: 'සැසි විස්තර පූරණය කළ නොහැක.', detailLoadErrorDetail: 'ඔබේ සුරකින ලද ඉතිහාසය වෙනස් කර නැත. මෙම සැසිය නැවත පූරණය කිරීමට උත්සාහ කරන්න.', detailRetry: 'සැසිය නැවත පූරණය කරන්න', detailEyebrow: 'සැසි විස්තර', detailCompletedTitle: 'මතක තබාගත යුතු කොටසක්.', detailCancelledTitle: 'ඔබේ ක්‍රමයට සම්පූර්ණ කළ කොටසක්.', detailSubtitle: 'ආරක්ෂා කළ එක් අවධානම් කොටසක සන්සුන් සටහනක්.', detailUnavailableTitle: 'සැසිය ලබාගත නොහැක', detailUnavailableDetail: 'මෙම සැසිය දේශීය ඉතිහාසයේ හමු නොවීය.', focusedLabel: 'අවධානය යොමු කළ', plannedLabel: 'සැලසුම් කළ', progressLabel: 'ප්‍රගතිය', progressAccessibility: 'සැලසුම් කළ අවධානම් කාලයෙන් සම්පූර්ණ කළ ප්‍රතිශතය' },
    welcome: { eyebrow: 'DEEP FOCUS', title: 'වැදගත් දේ කෙරෙහි අවධානය යොමු කරන්න.', subtitle: 'ඔබේ අවධානය ආරක්ෂා කරගෙන වැදගත් වැඩ නිම කර සුවපත් වීමට සන්සුන් අවකාශයක්.', promiseSessions: 'විශ්වාසදායක අවධානම් සැසි', promisePrivacy: 'පෞද්ගලික, උපාංගයේම ප්‍රගතිය', promisePace: 'පීඩනයකින් තොර තිරසාර වේගයක්', createAccount: 'ගිණුමක් සාදන්න', signIn: 'ඇතුල් වන්න' },
    signIn: { back: 'ආරම්භය', title: 'නැවත සාදරයෙන් පිළිගනිමු.', subtitle: 'ඔබේ අවධානය ආරක්ෂා කරගෙන ප්‍රගතිය එකට තබා ගැනීමට ඇතුල් වන්න.', email: 'විද්‍යුත් තැපෑල', password: 'මුරපදය', emailPlaceholder: 'you@example.com', passwordPlaceholder: 'ඔබේ මුරපදය', showPassword: 'මුරපදය පෙන්වන්න', hidePassword: 'මුරපදය සඟවන්න', signIn: 'ඇතුල් වන්න', signingIn: 'ඇතුල් වෙමින්…', google: 'Google සමඟ ඉදිරියට යන්න', apple: 'Apple සමඟ ඉදිරියට යන්න', forgotPassword: 'මුරපදය අමතකද?', newToApp: 'Deep Focus අලුත්ද?', createAccount: 'ගිණුමක් සාදන්න', privacy: 'ඔබේ අවධානම් ඉතිහාසය පෞද්ගලිකව සහ ඔබේ පාලනය යටතේ පවතී.' },
    signUp: { back: 'ඇතුල් වන්න', title: 'ඔබේ ගිණුම සාදන්න.', subtitle: 'ගිණුම් සමමුහුර්තකරණය සූදානම් වූ විට සහාය දක්වන උපාංග අතර ඔබේ අවධානම් පුහුණුව තබා ගන්න.', email: 'විද්‍යුත් තැපෑල', password: 'මුරපදය', confirmPassword: 'මුරපදය තහවුරු කරන්න', emailPlaceholder: 'you@example.com', passwordPlaceholder: 'මුරපදයක් තෝරන්න', confirmPlaceholder: 'මුරපදය නැවත ඇතුළත් කරන්න', showPassword: 'මුරපදය පෙන්වන්න', hidePassword: 'මුරපදය සඟවන්න', emailError: 'ඔබේ විද්‍යුත් තැපැල් ලිපිනය ඇතුළත් කරන්න.', passwordError: 'මුරපදයක් ඇතුළත් කරන්න.', confirmationError: 'මුරපද ගැළපිය යුතුය.', createAccount: 'ගිණුම සාදන්න', creatingAccount: 'ගිණුම සාදමින්…', google: 'Google සමඟ ගිණුම සාදන්න', existingAccount: 'දැනටමත් ගිණුමක් තිබේද?', signIn: 'ඇතුල් වන්න', privacy: 'ආරක්ෂිත ප්‍රවේශයට අවශ්‍ය ගිණුම් විස්තර පමණක් ඉල්ලන්නෙමු.' },
    recovery: { backSignIn: 'ඇතුල් වන්න', backSignUp: 'ලියාපදිංචි වන්න', resetTitle: 'ඔබේ මුරපදය නැවත සකසන්න.', resetSubtitle: 'ඔබේ ගිණුමට සම්බන්ධ email ලිපිනය ඇතුළත් කරන්න. නැවත අවධානම් පුහුණුවට යාමට අපි උදව් කරන්නෙමු.', accountEmail: 'ගිණුමේ විද්‍යුත් තැපෑල', emailPlaceholder: 'you@example.com', emailError: 'ඔබේ විද්‍යුත් තැපැල් ලිපිනය ඇතුළත් කරන්න.', sendLink: 'නැවත සකස් කිරීමේ සබැඳිය යවන්න', sending: 'යවමින්…', backToSignIn: 'ඇතුල් වීමට ආපසු', privacy: 'විද්‍යුත් තැපැල් ලිපිනයක් ලියාපදිංචිදැයි අපි හෙළි නොකරමු.', verifyTitle: 'ඔබේ inbox එක පරීක්ෂා කරන්න.', verifySubtitle: 'විද්‍යුත් තැපැල් තහවුරු කිරීම ඔබේ ගිණුම සහ අවධානම් දත්ත නිවැරදි පුද්ගලයාට සම්බන්ධව තබයි.', waitingTitle: 'තහවුරු කිරීම බලාපොරොත්තුවෙන්.', waitingBody: 'Deep Focus වෙතින් ලැබුණු පණිවිඩය විවෘත කර ආරක්ෂිත තහවුරු කිරීමේ සබැඳිය අනුගමනය කරන්න.', resend: 'තහවුරු කිරීමේ email නැවත යවන්න', verifiedPrivacy: 'ඔබේ email ලිපිනය තහවුරු කළ පසු ඇතුල් විය හැක.', newPasswordTitle: 'නව මුරපදයක් තෝරන්න.', newPasswordSubtitle: 'ඔබේ email එකට යැවූ ආරක්ෂිත recovery සබැඳිය භාවිත කර නව මුරපදය තෝරන්න.', newPassword: 'නව මුරපදය', confirmNewPassword: 'නව මුරපදය තහවුරු කරන්න', mismatch: 'මුරපද ගැළපිය යුතුය.', savePassword: 'නව මුරපදය සුරකින්න', saving: 'සුරකිමින්…' },
    home: { settings: 'සැකසුම් විවෘත කරන්න', brandTagline: 'වැදගත් දේ කෙරෙහි අවධානය යොමු කරන්න.', morning: 'සුභ උදෑසනක්', afternoon: 'සුභ දහවලක්', evening: 'සුභ සන්ධ්‍යාවක්', calmMorning: 'දවසට සන්සුන් ආරම්භයක්.', calmNight: 'වඩා නිහඬ සන්ධ්‍යාවකට ඉඩ දෙන්න.', calmDay: 'අද වැදගත් වැඩ සඳහා ඉඩ සාදන්න.', heroKicker: 'ඔබේ ඊළඟ අවධානම් කොටස', heroMeta: 'මිනිත්තු 25 · නිර්දේශිත', heroTitle: 'සන්සුන් මිනිත්තු 25ක ආරම්භයක්.', heroCopy: 'වැදගත් එක වැඩක් තෝරන්න. ඉතිරිය අපි බලාගන්නෙමු.', startFocus: 'අවධානම් සැසිය ආරම්භ කරන්න', startFocusAccessibility: 'මිනිත්තු 25ක අවධානම් සැසියක් ආරම්භ කරන්න', suggested: 'යෝජිත', flexible: 'නම්‍යශීලී', local: 'උපාංගයේම', private: 'පෞද්ගලික', pausedKicker: 'අවධානම් සැසිය නවතා ඇත', focusSession: 'අවධානම් සැසිය', remaining: 'ඉතිරිය', continue: 'ඉදිරියට යන්න', focusSoFar: 'ඔබේ මෙතෙක් අවධානය', noFocus: 'තවම අවධානම් කාලයක් නැහැ.', focusTime: 'අවධානම් කාලය', blocks: 'කොටස්', quickActions: 'ඉක්මන් ක්‍රියා', keepDayClear: 'ඔබේ දවස පැහැදිලිව තබා ගන්න.', tasks: 'කාර්ය', tasksDetail: 'ඊළඟට වැදගත් දේ තෝරන්න', goals: 'ඉලක්ක', goalsDetail: 'ඔබේ දිශාව පැහැදිලිව තබා ගන්න', plan: 'මගේ දවස සැලසුම් කරන්න', planDetail: 'සන්සුන් ආරම්භක ලක්ෂ්‍යයක් සාදන්න' },
    focus: { eyebrow: 'අවධානය', title: 'එක් දෙයකට ඉඩ සලසන්න.', subtitle: 'ඔබ සූදානම් වූ විට සන්සුන් අවධානම් කොටසක් ආරම්භ කරන්න.', sessionPaused: 'සැසිය නවතා ඇත', sessionActive: 'සැසිය ක්‍රියාත්මකයි', sessionReady: 'ඔබේ සැසිය නැවත ආරම්භ කිරීමට සූදානම්.', sessionProgress: 'ඔබේ අවධානම් සැසිය ක්‍රියාත්මකයි.', resume: 'සැසිය නැවත ආරම්භ කරන්න', returnToSession: 'සැසියට ආපසු යන්න', recommendedStart: 'නිර්දේශිත ආරම්භය', calmBlock: 'සන්සුන් මිනිත්තු 25ක කොටසක්.', chooseTask: 'වැදගත් එක කාර්යයක් තෝරා එයට කාලය වෙන් කරන්න.', start: 'අවධානම් සැසිය ආරම්භ කරන්න', flexibleTiming: 'නම්‍යශීලී කාලය', chooseDuration: 'ඔබේම කාලය තෝරන්න.', durationHint: 'මිනිත්තු 5 සිට 180 දක්වා කොටසක් සකසන්න.', configure: 'සකසන්න', savedLocally: 'යෙදුමට බාධා වූවත් ඔබේ සැසිය උපාංගයේ සුරැකේ.', setupTitle: 'සැසි සැකසුම', setupSubtitle: 'ආරම්භ කිරීමට පෙර ඔබේ අවධානම් සැසිය සකසන්න.', taskOptional: 'කාර්යයේ නම (විකල්ප)', taskPlaceholder: 'ඔබ අවධානය යොමු කිරීමට කැමති කුමක්ද?', linkedTask: 'සම්බන්ධ කළ කාර්යය', taskLoading: 'ඔබේ කාර්යය පූරණය කරමින්…', taskUnavailable: 'එම කාර්යය ලබාගත නොහැක. ඔබේ කාර්ය ලැයිස්තුව වෙනස් කර නැත; Tasks වෙත ආපසු ගොස් සක්‍රිය කාර්යයක් තෝරන්න.', duration: 'අවධානම් කාලය', custom: 'අභිරුචි', minutes: 'මිනිත්තු', settingsError: 'සුරකින ලද අවධානම් පෙරනිමිය කියවිය නොහැකි විය. ආරම්භයට පෙර කාලයක් තෝරන්න.', durationError: 'සැසි කාලය මිනිත්තු 5 සහ 180 අතර විය යුතුය.', startSession: 'අවධානම් සැසිය ආරම්භ කරන්න', backHome: 'මුල් පිටුවට ආපසු', summaryEyebrow: 'සැසි සාරාංශය', sessionComplete: 'සැසිය සම්පූර්ණයි.', sessionEnded: 'සැසිය අවසන්.', focusedWork: 'ඔබ අවධානයෙන් වැඩ කිරීමට ඉඩ සාදා ගත්තා.', endedBeforePlan: 'සැලසුම් කළ අවධානම් කාලයට පෙර ඔබේ සැසිය අවසන් විය.', focusSummary: 'අවධානම් සාරාංශය', focusTime: 'අවධානම් කාලය', planned: 'සැලසුම් කළ', status: 'තත්ත්වය', completed: 'සම්පූර්ණ කළ', cancelled: 'අවලංගු කළ', task: 'කාර්යය:', anotherSession: 'තවත් සැසියක් ආරම්භ කරන්න' },
    plan: { eyebrow: 'සැලැස්ම', title: 'වැදගත් දේ සඳහා ඉඩ සාදන්න.', subtitle: 'ඊළඟට වැඩ කිරීමට කාර්යයක් හෝ ඉලක්කයක් තෝරන්න.', tasks: 'කාර්ය', tasksDetail: 'ඔබේ ඊළඟ පියවර පැහැදිලිව තබා ගන්න.', goals: 'ඉලක්ක', goalsDetail: 'ඔබ තෝරාගත් ඉලක්ක පරීක්ෂා කරන්න.' },
    goals: { eyebrow: 'ඉලක්ක', title: 'ඔබේ දිශාව පැහැදිලිව තබා ගන්න.', subtitle: 'මැනිය හැකි එක් අරමුණක් සකසන්න. ඔබ තෝරාගත් ඉලක්කයට අවධානම් කාලය සහ සම්පූර්ණ කළ සැසි ගණන් වේ.', create: 'ඉලක්කයක් සාදන්න', newWeekly: 'නව සතිපතා ඉලක්කය', titleLabel: 'ඉලක්කයේ නම', titlePlaceholder: 'ඔබට සාක්ෂාත් කරගැනීමට අවශ්‍ය කුමක්ද?', sessions: 'සැසි', focusMinutes: 'අවධානම් මිනිත්තු', target: 'ඉලක්කය', save: 'ඉලක්කය සුරකින්න', cancel: 'අවලංගු කරන්න', yourGoals: 'ඔබේ ඉලක්ක', emptyLabel: 'තවම ඉලක්ක නැත', empty: 'ඔබ සූදානම් වූ විට සරල ඉලක්කයක් සාදන්න.', loading: 'ඉලක්ක පූරණය කරමින්', loadErrorTitle: 'ඔබේ ඉලක්ක පූරණය කළ නොහැකි විය.', loadErrorBody: 'ඔබේ සුරකින ලද ඉලක්ක වෙනස් කර නැත. ඉලක්ක සහ ප්‍රගතිය නැවත පූරණය කිරීමට උත්සාහ කරන්න.', retry: 'ඉලක්ක නැවත පූරණය කරන්න', sessionError: 'සැසි ගණන සම්පූර්ණ සංඛ්‍යාවක් ඇතුළත් කරන්න.', focusError: 'අවධානම් කාල ඉලක්කය මිනිත්තු වලින් නිවැරදිව ඇතුළත් කරන්න.', saveError: 'මෙම ඉලක්කය සුරැකිය නොහැකි විය. ඔබේ පැරණි ඉලක්ක තබා ඇත; නැවත උත්සාහ කරන්න.', back: 'ඉලක්ක වෙත ආපසු' },
    tasks: { eyebrow: 'කාර්ය', title: 'ඊළඟට වැදගත් දේ තෝරන්න.', subtitle: 'ඔබේ ඊළඟ පියවර පැහැදිලිව තබා අවධානයට සූදානම් කරන්න.', add: 'කාර්යයක් එක් කරන්න', newTask: 'නව කාර්යය', titleLabel: 'කාර්යයේ නම', placeholder: 'ඔබේ අවධානයට අවශ්‍ය කුමක්ද?', save: 'කාර්යය සුරකින්න', cancel: 'අවලංගු කරන්න', upNext: 'ඊළඟට', completed: 'සම්පූර්ණ කළ', archived: 'සංරක්ෂිත', showArchived: 'සංරක්ෂිත කාර්ය පෙන්වන්න', hideArchived: 'සංරක්ෂිත කාර්ය සඟවන්න', loading: 'කාර්ය පූරණය කරමින්…', loadError: 'ඔබේ කාර්ය පූරණය කළ නොහැකි විය. ඔබේ සුරකින ලද දත්ත නැවත සකසා නැත.', retry: 'කාර්ය නැවත පූරණය කරන්න', saving: 'වෙනස්කම් සුරකිමින්…', saveError: 'වෙනස්කම් සුරැකිය නොහැකි විය. ඔබේ කාර්ය ලැයිස්තුව සහ draft තබා ඇත. නැවත උත්සාහ කරන්න.', noActive: 'සක්‍රිය කාර්ය නැත. ඔබ සූදානම් වූ විට එකක් එක් කරන්න.', cleared: 'ඔබේ කාර්ය ලැයිස්තුව හිස් කර ඇත.', archivedState: 'සංරක්ෂිත', completedState: 'සම්පූර්ණ කළ', ready: 'අවධානයට සූදානම්', complete: 'සම්පූර්ණ කරන්න' },
    profile: { eyebrow: 'පැතිකඩ', title: 'අවධානය ඔබට ගැළපෙන ලෙස සකසන්න.', subtitle: 'ඔබේ මනාප සහ ප්‍රගතිය එකම සන්සුන් ස්ථානයක තබා ගන්න.', cardLabel: 'ඔබේ පැතිකඩ', cardTitle: 'ඔබට වඩාත් ගැළපෙන අවධානම් පුහුණුවක්.', cardDetail: 'ඔබේ අවධානම් මනාප සහ onboarding පිළිතුරු මත සෑදූ පැතිකඩ පරීක්ෂා කරන්න.', review: 'පැතිකඩ පරීක්ෂා කරන්න', focusSection: 'ඔබේ අවධානය', history: 'අවධානම් ඉතිහාසය', historyDetail: 'ඔබ ආරක්ෂා කිරීමට තෝරාගත් කාලය බලන්න.', goals: 'ඉලක්ක', goalsDetail: 'අර්ථවත් ප්‍රගතිය දෘශ්‍යමානව තබා ගන්න.', tasks: 'කාර්ය', tasksDetail: 'ඔබේ අවධානයට සුදුසු දේ තෝරන්න.', resources: 'සම්පත්', resourcesDetail: 'ඔබේ වැඩට අදාළ පෞද්ගලික යොමු සහ සබැඳි ළඟ තබා ගන්න.', recovery: 'සැසි ප්‍රතිසාධනය', recoveryDetail: 'බාධා වූ අවධානම් සැසියක් පරීක්ෂා කරන්න.', preferences: 'මනාප', settings: 'සැකසුම්', settingsDetail: 'සහාය දක්වන යෙදුම් මනාප කළමනාකරණය කරන්න.', signedIn: 'ඇතුල් වී ඇත', offlineAccount: 'මෙම ගිණුම සඳහා මෙම උපාංගයේ වෙනම offline දත්ත අවකාශයක් පවතී.', signOut: 'ඉවත් වන්න', signingOut: 'ඉවත් වෙමින්…', signOutDetail: 'මෙය මෙම උපාංගයේ පමණක් ඇති දත්ත එකතු කිරීමක් හෝ මකා දැමීමක් නොකරයි.', signIn: 'ඇතුල් වන්න', signInDetail: 'මෙම උපාංගයේ ඔබේ ගිණුම භාවිත කිරීමට ඇතුල් වන්න.', privateNote: 'ආරක්ෂිත සමමුහුර්තකරණය සකස් කර තහවුරු කරන තුරු ඔබේ ගිණුමේ අවධානම් දත්ත මෙම උපාංගයේම පවතී.', syncStatus: 'දත්ත සමමුහුර්ත තත්ත්වය', syncStatusLoading: 'දේශීයව බලා සිටින වෙනස්කම් පරීක්ෂා කරමින්…', syncStatusLocalDetail: 'ආරක්ෂිත ගිණුම් සමමුහුර්තකරණය තවම සක්‍රිය නැත. ඔබේ දත්ත මෙම උපාංගයේම පවතී.', syncStatusPendingDetail: 'ආරක්ෂිත සමමුහුර්තකරණය සඳහා දේශීය වෙනස්කම් {count}ක් බලා සිටී. ඔබේ දත්ත මෙම උපාංගයේ තබා ඇත.', syncStatusUnavailable: 'දේශීය සමමුහුර්ත තත්ත්වය කියවිය නොහැක. ඔබේ සුරකින ලද දත්ත වෙනස් කර නැත.' },
    planner: { back: 'මුල් පිටුව', eyebrow: 'මගේ දවස සැලසුම් කරන්න', title: 'වැදගත් දේකින් ආරම්භ කරන්න.', subtitle: 'ඔබට ඇති කාර්ය සහ කාලය තෝරන්න. ඔබේ දවසට සරල ආරම්භයක් අපි යෝජනා කරන්නෙමු.', timeAvailable: 'ලබාගත හැකි කාලය', availableMinutes: 'ලබාගත හැකි මිනිත්තු', minutes: 'මිනිත්තු', minError: 'සැලසුම් කිරීමට අවම වශයෙන් මිනිත්තු 25ක් ඇතුළත් කරන්න.', numberError: 'කුඩා සම්පූර්ණ මිනිත්තු ගණනක් ඇතුළත් කරන්න.', breakHint: 'සෑම යෝජනාවකම කෙටි විවේකයකට ඉඩ තබයි.', chooseTasks: 'කාර්ය තෝරන්න', loading: 'ඔබේ කාර්ය පූරණය කරමින්…', loadError: 'ඔබේ කාර්ය පූරණය කළ නොහැක. සුරකින ලද කාර්ය වෙනස් කර නැත.', retry: 'කාර්ය නැවත පූරණය කරන්න', empty: 'මුලින් කාර්යයක් එක් කර පසුව සැලැස්මක් සාදන්න.', addTask: 'කාර්යයක් එක් කරන්න', selected: 'තෝරා ඇත', notSelected: 'තෝරා නැත', suggest: 'සැලැස්මක් යෝජනා කරන්න', suggestion: 'ඔබේ යෝජනාව', included: 'ඔබේ යෝජනාවට ඇතුළත්', startingPoint: 'පැහැදිලි ආරම්භක ලක්ෂ්‍යයක්.', blockDuration: 'අවධානය මිනිත්තු 25 · විවේකය මිනිත්තු 5', moveEarlier: 'කාර්යය', moveEarlierSuffix: 'ඉදිරියට', moveLater: 'කාර්යය', moveLaterSuffix: 'පසුවට', start: 'ආරම්භ කරන්න', proposalNote: 'මෙය යෝජනාවක් පමණි. ඔබේ කාර්ය හෝ කාලසටහන වෙනස් කර නැත.', confirmed: 'ඔබ මෙම තේරීම තහවුරු කළා. කාර්යයක් ආරම්භ කිරීම සාමාන්‍ය අවධානම් ක්‍රියාවලිය භාවිත කරයි.', confirm: 'මෙම යෝජනාව තහවුරු කරන්න', adjust: 'තේරීම වෙනස් කරන්න', saved: 'මෙම තහවුරු කළ සැලැස්ම මෙම උපාංගයේ සුරකින ලදී.', saveError: 'මෙම සැලැස්ම සුරැකිය නොහැක. ඔබේ කාර්ය වෙනස් කර නැත; නැවත තහවුරු කිරීමට උත්සාහ කරන්න.' },
    resourcesPage: { title: 'සම්පත්', subtitle: 'පෞද්ගලික යොමු සහ HTTPS සබැඳි මෙම උපාංගයේ සුරකින්න. කිසිවක් upload නොවේ.', add: 'සම්පතක් එක් කරන්න', titleInput: 'මාතෘකාව', referenceInput: 'යොමු හෝ HTTPS සබැඳිය', typeReference: 'යොමු', typeLink: 'HTTPS සබැඳිය', save: 'සම්පත සුරකින්න', saving: 'සුරකිමින්…', loading: 'දේශීය සම්පත් පූරණය කරමින්…', empty: 'තවම local සම්පත් නැහැ.', loadError: 'සම්පත් පූරණය කළ නොහැක. කිසිවක් වෙනස් කර නැහැ.', saveError: 'සම්පත සුරැකීමට හෝ යාවත්කාලීන කිරීමට නොහැක. වෙනත් කිසිවක් වෙනස් කර නැහැ.', retry: 'නැවත උත්සාහ කරන්න', missing: 'නැති බව සලකුණු කර ඇත', markMissing: 'නැති ලෙස සලකුණු කරන්න', saved: 'මෙම උපාංගයේ සුරකින ලදී.', taskSection: 'සම්පත්', taskSectionDetail: 'තෝරාගත් පෞද්ගලික යොමු මෙම කාර්යය සමඟ තබා ගන්න. කිසිවක් upload නොවේ.', taskEmpty: 'තවම local සම්පත් නැහැ. Profile → Resources වෙතින් එකක් එක් කරන්න.', link: 'සම්බන්ධ කරන්න', linked: 'සම්බන්ධ කර ඇත', linkChangedError: 'මෙම සම්පත වෙනස් වී ඇත හෝ ලබාගත නොහැක. කාර්යය නැවත පූරණය කරන්න.', linkUnavailableError: 'සම්පත් සම්බන්ධය වෙනස් කළ නොහැක.' },
    taskDetail: { back: 'කාර්ය වෙත ආපසු', loadErrorTitle: 'මෙම කාර්යය පූරණය කළ නොහැක.', loadErrorDetail: 'ඔබේ සුරකින ලද කාර්ය වෙනස් කර නැත. නැවත උත්සාහ කරන්න.', retryLoad: 'කාර්යය නැවත පූරණය කරන්න', unavailableTitle: 'කාර්යය ලබාගත නොහැක', unavailableDetail: 'මෙම උපාංගයේ මෙම කාර්යය හමු නොවීය.', eyebrow: 'කාර්ය විස්තර', editTitle: 'කාර්ය මාතෘකාව සංස්කරණය කරන්න', descriptionPlaceholder: 'සටහනක් එක් කරන්න (විකල්ප)', dueDateLabel: 'අවසන් දිනය (UTC දින ආකෘතිය, විකල්ප)', blankDateHint: 'හිස් දිනයක් යනු අවසන් දිනයක් නැති බවයි. දිනය උපාංග අතර එකම ලෙස පවතී.', priorityLabel: 'ප්‍රමුඛතාව (විකල්ප)', goalLabel: 'ඉලක්කය (විකල්ප)', loadingGoals: 'ඔබේ ඉලක්ක පූරණය වෙමින්…', goalsLoadError: 'ඔබේ ඉලක්ක පූරණය කළ නොහැක. දැනට ඇති ඉලක්ක සම්බන්ධය එලෙසම පවතී; වෙනස් ඉලක්කයක් තෝරා නැවත උත්සාහ කරන්න.', retryGoals: 'ඉලක්ක නැවත පූරණය කරන්න', noGoal: 'ඉලක්කයක් නැත', createGoalFirst: 'මෙම කාර්යයට සම්බන්ධ කිරීමට පළමුව ඉලක්කයක් සාදන්න.', dueDatePrefix: 'අවසන් දිනය', priorityPrefix: 'ප්‍රමුඛතාව', archivedStatus: 'සංරක්ෂිතයි. මෙම කාර්යය සක්‍රිය ලැයිස්තුවලින් සඟවා ඇති අතර අවධානම් ඉතිහාසය රැකේ.', completedStatus: 'සම්පූර්ණයි. ඔබ වැදගත් වැඩකට ඉඩ සෑදුවා.', cancelledStatus: 'මෙම කාර්යය අවලංගු කර ඇත.', readyStatus: 'ඔබේ ඊළඟ අවධානම් කොටසට සූදානම්.', pendingSave: 'මෙම කාර්යය සුරැකිය නොහැක. එය තවම පොරොත්තුවෙන් ඇත; නැවත උත්සාහ කරන්න.', reload: 'කාර්යය නැවත පූරණය කරන්න', deleteTitle: 'මෙම කාර්යය මකන්නද?', deleteDetail: 'කාර්යය ඉවත් වේ. අවධානම් සැසි ඉතිහාසයේ පවතින අතර සන්දර්භය සඳහා කාර්ය නාමය රැකේ.', deleteConfirm: 'ඉතිහාසය තබා කාර්යය මකන්න', keepTask: 'කාර්යය තබා ගන්න', saveDetails: 'කාර්ය විස්තර සුරකින්න', cancelEditing: 'සංස්කරණය අවලංගු කරන්න', editDetails: 'කාර්ය විස්තර සංස්කරණය කරන්න', complete: 'කාර්යය සම්පූර්ණ කරන්න', focus: 'මෙම කාර්යයට අවධානය යොමු කරන්න', restore: 'කාර්යය නැවත ගන්න', archive: 'කාර්යය සංරක්ෂණය කරන්න', delete: 'කාර්යය මකන්න', noPriority: 'ප්‍රමුඛතාවක් නැත', low: 'අඩු', medium: 'මධ්‍යම', high: 'ඉහළ' },
    settingsPage: { back: 'පැතිකඩ', eyebrow: 'සැකසුම්', title: 'වඩා සන්සුන් පෙරනිමියක් සකසන්න.', subtitle: 'Deep Focus ඔබේ අවධානයට සහාය විය යුතු ආකාරය තෝරන්න.', loading: 'ඔබේ සුරකින ලද සැකසුම් පූරණය වෙමින්…', loadErrorTitle: 'ඔබේ සැකසුම් වෙනස් වී නැත.', loadErrorDetail: 'සුරකින ලද මනාප කියවිය නොහැක. කිසිදු පෙරනිමියක් ඒ මත ලියා නැත.', retry: 'නැවත උත්සාහ කරන්න', focusSection: 'අවධානය', focusDuration: 'පෙරනිමි අවධානම් කාලය', focusHint: 'නව අවධානම් සැසි සඳහා භාවිත වේ. සුරකීමෙන් පසු වෙනස්කම් තහවුරු වේ.', saving: 'ඔබේ තේරීම සුරකිමින්…', breakDuration: 'පෙරනිමි විවේක කාලය', breakHint: 'ඉදිරි විවේක සඳහා භාවිත වේ. සුරකීමෙන් පසු වෙනස්කම් තහවුරු වේ.', saveError: 'ඔබේ වෙනස සුරැකී නැත. පෙර තේරීම තවම තෝරා ඇත. නැවත උත්සාහ කරන්න.', appearanceSection: 'පෙනුම සහ ප්‍රවේශ පහසුකම්', appearance: 'පෙනුම', systemTheme: 'පද්ධතිය · ඔබේ උපාංග තේමාව අනුගමනය කරයි', reducedMotion: 'අඩු චලනය', reducedMotionDetail: 'ඔබේ උපාංග ප්‍රවේශ පහසුකම් මනාපය අනුගමනය කරයි', languageDetailSuffix: 'සම්පූර්ණ පරිවර්තනය සහ ප්‍රවේශ පහසුකම් සමාලෝචනය තවම ඉතිරිව ඇත.', notificationsSection: 'දැනුම්දීම් සහ ප්‍රතිචාර', notifications: 'දැනුම්දීම්', notificationsDetail: 'දැනුම්දීම් කාලසටහන්කරණය තවම සකසා නැත', sound: 'ශබ්ද සහ ස්පර්ශ ප්‍රතිචාර', soundDetail: 'සැසි ප්‍රතිචාර සමඟ පාලන ලබාගත හැක', privacySection: 'පෞද්ගලිකත්වය සහ ගිණුම', localFirst: 'පළමුව උපාංගයේ දත්ත', localFirstDetail: 'සමමුහුර්තකරණය සකසා නැති අතර ඔබේ අවධානම් සැසි මෙම උපාංගයේ පවතී.', account: 'ගිණුම', accountDetail: 'ගිණුම් ප්‍රවේශය ලබාගත් විට ඇතුල් වන්න' },
    onboarding: { intro: { back: 'ආරම්භයට', title: 'ඔබට ගැළපෙන අවධානම් පුරුද්දක් ගොඩනගන්න.', subtitle: 'පීඩනයක් එකතු නොකර Deep Focus අත්දැකීම ඔබට වඩාත් ප්‍රයෝජනවත් කිරීමට සිතාගත් ප්‍රශ්න කිහිපයක් උපකාරී වේ.', stepOneTitle: 'ඔබට උපකාරී දේ බෙදාගන්න', stepOneDetail: 'ඔබ කැමති වේගය සහ අවධානම් පරිසරය ගැන කියන්න.', stepTwoTitle: 'ඔබේ සැකසුම සකසන්න', stepTwoDetail: 'කිසිවක් යෙදීමට පෙර යෝජනා සමාලෝචනය කරන්න.', stepThreeTitle: 'සන්සුන්ව ආරම්භ කරන්න', stepThreeDetail: 'ඔබ සූදානම් වූ විට සන්සුන්, විශ්වාසදායක සැසියකින් ආරම්භ කරන්න.', start: 'පෞද්ගලික ඇගයීම ආරම්භ කරන්න', skip: 'දැනට මඟහරින්න', privacy: 'පාලනය ඔබ සතුව පවතී. ඔබේ පිළිතුරු යෝජනා පමණි; බැඳීම් නොවේ.' }, assessment: { backOnboarding: 'Onboarding', previous: 'පෙර ප්‍රශ්නය', eyebrow: 'පෞද්ගලික ඇගයීම', title: 'ඔබේ වේගයට ප්‍රශ්න කිහිපයක්.', subtitle: 'වැරදි පිළිතුරු නැත. ඔබට සමීපම දේ තෝරන්න, නැතහොත් ආපසු ගොස් වෙනස් කරන්න.', loading: 'ඔබේ සුරකින ලද පිළිතුරු පූරණය වෙමින්…', error: 'ඔබේ පිළිතුර සුරැකිය නොහැක. ඔබේ තේරීම පෙන්වමින් පවතී. සූදානම් වූ විට නැවත උත්සාහ කරන්න.', choices: 'පිළිතුරු තේරීම්', viewProfile: 'මගේ පැතිකඩ බලන්න', next: 'ඊළඟ ප්‍රශ්නය', retry: 'පිළිතුර නැවත සුරකින්න', skip: 'ඇගයීම මඟහරින්න', privacy: 'ඔබේ සමාලෝචනය සඳහා යෝජනා සකස් කිරීමට ඔබේ පිළිතුරු භාවිත වේ.' }, profile: { back: 'ඇගයීමට ආපසු', eyebrow: 'ඔබේ පැතිකඩ', title: 'ඔබේ ආරම්භක ස්ථානය.', noAnswers: 'ඔබේ මනාප තවම එකතු කර නැත.', noAnswersDetail: 'විකල්ප ඇගයීම ආරම්භ කරන්න, නැතහොත් යෙදුමේ සම්මත සැකසුම් සමඟ ඉදිරියට යන්න.', start: 'පෞද්ගලික ඇගයීම ආරම්භ කරන්න', continueDefaults: 'පෙරනිමි සමඟ ඉදිරියට යන්න', subtitle: 'මෙම ඇගයීම සඳහා ඔබ බෙදාගත් තේරීම් මෙහි ඇත. ඒවා දිගුකාලීන නිගමන නොවේ.', shared: 'ඔබ බෙදාගත් දේ', sharedDetail: 'මෙම ඇගයීම සඳහා ඔබේ තේරීම', suggestions: 'සමාලෝචනය කිරීමට යෝජනා', suggestionDetail: 'විකල්ප ආරම්භක අදහසක්; කිසිවක් යොදා නැත', saved: 'මෙම උපාංගයේ සුරකින ලදී', savedDetail: 'මෙම ක්‍රියාවලිය නැවත ලබාගත හැකි වන පරිදි ඔබේ පිළිතුරු local app database එකේ සුරකී. තහවුරු කළ පසු පමණක් යෝජනා යෙදේ.', saving: 'ඔබේ නවතම තේරීම සුරකිමින්…', saveError: 'ඔබේ නවතම තේරීම සුරැකිය නොහැක. සුරකින ලද අනුවාදය තබා ඇත. නැවත උත්සාහ කරන්න.', retry: 'පිළිතුර නැවත සුරකින්න', review: 'යෙදීමට පෙර සමාලෝචනය කරන්න', reviewDetail: 'මෙය ඉදිරි අවධානම් කොටස් {focus} මිනිත්තු සහ විවේක {break} මිනිත්තු ලෙස සකසයි. පවතින කාර්ය හෝ ක්‍රියාත්මක සැසිය වෙනස් නොවේ.', applied: 'ඔබේ local සැකසුම්වලට යොදන ලදී.', applyError: 'යෝජනාව යෙදිය නොහැක. පෙර සැකසුම් වෙනස් වී නැත. නැවත උත්සාහ කරන්න.', apply: 'යෝජනා මගේ සැකසුම්වලට යොදන්න', appliedButton: 'සැකසුම් යොදන ලදී', startFocus: 'අවධානම් සැසියක් ආරම්භ කරන්න', useDefaults: 'යෙදුමේ සම්මත සැකසුම් භාවිත කරන්න' } },
  },
  ta: {
    tabs: { home: 'முகப்பு', plan: 'திட்டம்', focus: 'கவனம்', progress: 'முன்னேற்றம்', profile: 'சுயவிவரம்' },
    settings: { language: 'செயலி மொழி', languageHint: 'சேமிக்கப்பட்ட இடைமுக மொழியைத் தேர்ந்தெடுக்கவும்.' },
    historyPage: { back: 'முன்னேற்றத்திற்குத் திரும்பு', title: 'அமர்வு வரலாறு', subtitle: 'நீங்கள் பாதுகாக்கத் தேர்ந்தெடுத்த நேரத்தின் அமைதியான பதிவு.', loading: 'அமர்வு வரலாறு ஏற்றப்படுகிறது', loadErrorTitle: 'அமர்வு வரலாற்றை ஏற்ற முடியவில்லை.', loadErrorDetail: 'சேமித்த அமர்வுகள் மாற்றப்படவில்லை. அவற்றை மீண்டும் ஏற்ற முயற்சிக்கவும்.', retry: 'அமர்வு வரலாற்றை மீண்டும் ஏற்றவும்', noSessionsLabel: 'கவன அமர்வுகள் இன்னும் பதிவு செய்யப்படவில்லை', noSessionsTitle: 'அமர்வுகள் இன்னும் இல்லை', noSessionsDetail: 'முடிக்கப்பட்ட கவன அமர்வுகள் இங்கே தோன்றும்.', startFocus: 'கவன அமர்வைத் தொடங்கவும்', focusTime: 'கவன நேரம்', completed: 'முடிந்தது', allSessions: 'அனைத்து அமர்வுகள்', completedFilter: 'முடிந்தது', cancelledFilter: 'ரத்து செய்யப்பட்டது', noMatchingTitle: 'பொருந்தும் அமர்வுகள் இல்லை', noMatchingDetail: 'உங்கள் கவன வரலாற்றைப் பார்க்க வேறு வடிகட்டியைத் தேர்ந்தெடுக்கவும்.', recent: 'சமீபத்திய அமர்வுகள்', openDetailsHint: 'அமர்வு விவரங்களைத் திறக்கவும்', focusSession: 'கவன அமர்வு', cancelled: 'ரத்து செய்யப்பட்டது', completedStatus: 'முடிந்தது', focused: 'கவனம் செலுத்தப்பட்டது', of: 'இல்', detailLoading: 'அமர்வு விவரங்கள் ஏற்றப்படுகின்றன', detailLoadErrorTitle: 'அமர்வு விவரங்களை ஏற்ற முடியவில்லை.', detailLoadErrorDetail: 'சேமித்த வரலாறு மாற்றப்படவில்லை. இந்த அமர்வை மீண்டும் ஏற்ற முயற்சிக்கவும்.', detailRetry: 'அமர்வை மீண்டும் ஏற்றவும்', detailEyebrow: 'அமர்வு விவரம்', detailCompletedTitle: 'நினைவில் வைத்திருக்க வேண்டிய பகுதி.', detailCancelledTitle: 'உங்கள் முறையில் முடிக்கப்பட்ட பகுதி.', detailSubtitle: 'பாதுகாக்கப்பட்ட ஒரு கவனத் தொகுதியின் அமைதியான பதிவு.', detailUnavailableTitle: 'அமர்வு கிடைக்கவில்லை', detailUnavailableDetail: 'இந்த அமர்வு உள்ளூர் வரலாற்றில் கிடைக்கவில்லை.', focusedLabel: 'கவனம் செலுத்தப்பட்டது', plannedLabel: 'திட்டமிடப்பட்டது', progressLabel: 'முன்னேற்றம்', progressAccessibility: 'திட்டமிடப்பட்ட கவன நேரத்தில் முடிக்கப்பட்ட சதவீதம்' },
    welcome: { eyebrow: 'DEEP FOCUS', title: 'முக்கியமானவற்றில் கவனம் செலுத்துங்கள்.', subtitle: 'உங்கள் கவனத்தைப் பாதுகாத்து, அர்த்தமுள்ள பணிகளை முடித்து, நன்றாக மீள ஒரு அமைதியான இடம்.', promiseSessions: 'நம்பகமான கவன அமர்வுகள்', promisePrivacy: 'தனிப்பட்ட, சாதனத்திலேயே முன்னேற்றம்', promisePace: 'அழுத்தமில்லாத நிலையான வேகம்', createAccount: 'கணக்கை உருவாக்கவும்', signIn: 'உள்நுழைக' },
    signIn: { back: 'முகப்பு', title: 'மீண்டும் வரவேற்கிறோம்.', subtitle: 'உங்கள் கவனத்தைப் பாதுகாத்து முன்னேற்றத்தை ஒன்றாக வைத்திருக்க உள்நுழைக.', email: 'மின்னஞ்சல்', password: 'கடவுச்சொல்', emailPlaceholder: 'you@example.com', passwordPlaceholder: 'உங்கள் கடவுச்சொல்', showPassword: 'கடவுச்சொல்லைக் காட்டு', hidePassword: 'கடவுச்சொல்லை மறை', signIn: 'உள்நுழைக', signingIn: 'உள்நுழைகிறது…', google: 'Google மூலம் தொடரவும்', apple: 'Apple மூலம் தொடரவும்', forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?', newToApp: 'Deep Focus-க்கு புதியவரா?', createAccount: 'கணக்கை உருவாக்கவும்', privacy: 'உங்கள் கவன வரலாறு தனிப்பட்டதாகவும் உங்கள் கட்டுப்பாட்டிலும் இருக்கும்.' },
    signUp: { back: 'உள்நுழைக', title: 'உங்கள் கணக்கை உருவாக்கவும்.', subtitle: 'கணக்கு ஒத்திசைவு தயாரானதும் ஆதரிக்கப்படும் சாதனங்களில் உங்கள் கவனப் பயிற்சியை வைத்திருக்கவும்.', email: 'மின்னஞ்சல்', password: 'கடவுச்சொல்', confirmPassword: 'கடவுச்சொல்லை உறுதிசெய்க', emailPlaceholder: 'you@example.com', passwordPlaceholder: 'கடவுச்சொல்லைத் தேர்ந்தெடுக்கவும்', confirmPlaceholder: 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்', showPassword: 'கடவுச்சொல்லைக் காட்டு', hidePassword: 'கடவுச்சொல்லை மறை', emailError: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்.', passwordError: 'கடவுச்சொல்லை உள்ளிடவும்.', confirmationError: 'கடவுச்சொற்கள் பொருந்த வேண்டும்.', createAccount: 'கணக்கை உருவாக்கவும்', creatingAccount: 'கணக்கு உருவாக்கப்படுகிறது…', google: 'Google மூலம் கணக்கை உருவாக்கவும்', existingAccount: 'ஏற்கனவே கணக்கு உள்ளதா?', signIn: 'உள்நுழைக', privacy: 'பாதுகாப்பான அணுகலுக்குத் தேவையான கணக்கு விவரங்களை மட்டும் கேட்போம்.' },
    recovery: { backSignIn: 'உள்நுழைக', backSignUp: 'பதிவு செய்க', resetTitle: 'உங்கள் கடவுச்சொல்லை மீட்டமைக்கவும்.', resetSubtitle: 'உங்கள் கணக்குடன் இணைக்கப்பட்ட மின்னஞ்சலை உள்ளிடுங்கள்; உங்கள் கவனப் பயிற்சிக்குத் திரும்ப உதவுவோம்.', accountEmail: 'கணக்கு மின்னஞ்சல்', emailPlaceholder: 'you@example.com', emailError: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்.', sendLink: 'மீட்டமைப்பு இணைப்பை அனுப்பவும்', sending: 'அனுப்பப்படுகிறது…', backToSignIn: 'உள்நுழைவுக்குத் திரும்பு', privacy: 'மின்னஞ்சல் பதிவு செய்யப்பட்டுள்ளதா என்பதை வெளிப்படுத்த மாட்டோம்.', verifyTitle: 'உங்கள் inbox-ஐச் சரிபார்க்கவும்.', verifySubtitle: 'மின்னஞ்சல் சரிபார்ப்பு உங்கள் கணக்கையும் கவனத் தரவையும் சரியான நபருடன் பாதுகாப்பாக இணைக்க உதவுகிறது.', waitingTitle: 'சரிபார்ப்பு காத்திருக்கிறது.', waitingBody: 'Deep Focus-இலிருந்து வந்த செய்தியைத் திறந்து பாதுகாப்பான சரிபார்ப்பு இணைப்பைப் பின்பற்றவும்.', resend: 'சரிபார்ப்பு மின்னஞ்சலை மீண்டும் அனுப்பவும்', verifiedPrivacy: 'உங்கள் மின்னஞ்சல் சரிபார்க்கப்பட்ட பிறகு உள்நுழையலாம்.', newPasswordTitle: 'புதிய கடவுச்சொல்லைத் தேர்ந்தெடுக்கவும்.', newPasswordSubtitle: 'உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்ட பாதுகாப்பான மீட்பு இணைப்பைப் பயன்படுத்தி புதிய கடவுச்சொல்லைத் தேர்ந்தெடுக்கவும்.', newPassword: 'புதிய கடவுச்சொல்', confirmNewPassword: 'புதிய கடவுச்சொல்லை உறுதிசெய்க', mismatch: 'கடவுச்சொற்கள் பொருந்த வேண்டும்.', savePassword: 'புதிய கடவுச்சொல்லைச் சேமிக்கவும்', saving: 'சேமிக்கப்படுகிறது…' },
    home: { settings: 'அமைப்புகளைத் திறக்கவும்', brandTagline: 'முக்கியமானவற்றில் கவனம் செலுத்துங்கள்.', morning: 'காலை வணக்கம்', afternoon: 'மதிய வணக்கம்', evening: 'மாலை வணக்கம்', calmMorning: 'நாளை அமைதியாகத் தொடங்குங்கள்.', calmNight: 'அமைதியான மாலைக்கு இடமளிக்கவும்.', calmDay: 'இன்று முக்கியமான பணிகளுக்கு இடமளிக்கவும்.', heroKicker: 'உங்கள் அடுத்த கவனத் தொகுதி', heroMeta: '25 நிமிடம் · பரிந்துரைக்கப்படுகிறது', heroTitle: 'அமைதியான 25 நிமிடத் தொடக்கம்.', heroCopy: 'ஒரு முக்கியமான பணியைத் தேர்ந்தெடுக்கவும். மீதியை நாங்கள் கவனிப்போம்.', startFocus: 'கவன அமர்வைத் தொடங்கவும்', startFocusAccessibility: '25 நிமிட கவன அமர்வைத் தொடங்கவும்', suggested: 'பரிந்துரைக்கப்பட்டது', flexible: 'நெகிழ்வானது', local: 'சாதனத்திலேயே', private: 'தனிப்பட்டது', pausedKicker: 'கவன அமர்வு இடைநிறுத்தப்பட்டது', focusSession: 'கவன அமர்வு', remaining: 'மீதம்', continue: 'தொடரவும்', focusSoFar: 'இதுவரை உங்கள் கவனம்', noFocus: 'இதுவரை கவன நேரம் இல்லை.', focusTime: 'கவன நேரம்', blocks: 'தொகுதிகள்', quickActions: 'விரைவு செயல்கள்', keepDayClear: 'உங்கள் நாளை தெளிவாக வைத்திருங்கள்.', tasks: 'பணிகள்', tasksDetail: 'அடுத்து முக்கியமானதைத் தேர்ந்தெடுக்கவும்', goals: 'இலக்குகள்', goalsDetail: 'உங்கள் திசையைத் தெளிவாக வைத்திருங்கள்', plan: 'என் நாளைத் திட்டமிடு', planDetail: 'அமைதியான தொடக்கத்தை உருவாக்கவும்' },
    focus: { eyebrow: 'கவனம்', title: 'ஒரு விஷயத்திற்கு இடமளிக்கவும்.', subtitle: 'நீங்கள் தயாராக இருக்கும்போது அமைதியான கவனத் தொகுதியைத் தொடங்குங்கள்.', sessionPaused: 'அமர்வு இடைநிறுத்தப்பட்டது', sessionActive: 'அமர்வு செயலில் உள்ளது', sessionReady: 'உங்கள் அமர்வு தொடரத் தயாராக உள்ளது.', sessionProgress: 'உங்கள் கவன அமர்வு நடைபெறுகிறது.', resume: 'அமர்வைத் தொடரவும்', returnToSession: 'அமர்வுக்குத் திரும்பவும்', recommendedStart: 'பரிந்துரைக்கப்பட்ட தொடக்கம்', calmBlock: 'அமைதியான 25 நிமிடத் தொகுதி.', chooseTask: 'ஒரு முக்கியமான பணியைத் தேர்ந்தெடுத்து அதற்கான நேரத்தைப் பாதுகாக்கவும்.', start: 'கவன அமர்வைத் தொடங்கவும்', flexibleTiming: 'நெகிழ்வான நேரம்', chooseDuration: 'உங்கள் நேரத்தைத் தேர்ந்தெடுக்கவும்.', durationHint: '5 முதல் 180 நிமிடங்கள் வரை கவனத் தொகுதியை அமைக்கவும்.', configure: 'அமைக்கவும்', savedLocally: 'செயலி தடைப்பட்டாலும் உங்கள் அமர்வு சாதனத்தில் சேமிக்கப்படும்.', setupTitle: 'அமர்வு அமைப்பு', setupSubtitle: 'தொடங்குவதற்கு முன் உங்கள் கவன அமர்வை அமைக்கவும்.', taskOptional: 'பணி பெயர் (விருப்பம்)', taskPlaceholder: 'எதில் கவனம் செலுத்த விரும்புகிறீர்கள்?', linkedTask: 'இணைக்கப்பட்ட பணி', taskLoading: 'உங்கள் பணி ஏற்றப்படுகிறது…', taskUnavailable: 'அந்தப் பணியைப் பயன்படுத்த முடியவில்லை. உங்கள் பணிப் பட்டியல் மாற்றப்படவில்லை; பணிகளுக்குத் திரும்பி செயலில் உள்ள பணியைத் தேர்ந்தெடுக்கவும்.', duration: 'கவன நேரம்', custom: 'தனிப்பயன்', minutes: 'நிமிடங்கள்', settingsError: 'சேமித்த கவன இயல்புநிலையைப் படிக்க முடியவில்லை. தொடங்குவதற்கு முன் நேரத்தைத் தேர்ந்தெடுக்கவும்.', durationError: 'அமர்வு நேரம் 5 முதல் 180 நிமிடங்களுக்குள் இருக்க வேண்டும்.', startSession: 'கவன அமர்வைத் தொடங்கவும்', backHome: 'முகப்புக்குத் திரும்பவும்', summaryEyebrow: 'அமர்வு சுருக்கம்', sessionComplete: 'அமர்வு முடிந்தது.', sessionEnded: 'அமர்வு முடிவடைந்தது.', focusedWork: 'கவனத்துடன் வேலை செய்ய நீங்கள் நேரம் உருவாக்கினீர்கள்.', endedBeforePlan: 'திட்டமிட்ட கவன நேரத்திற்கு முன் உங்கள் அமர்வு முடிந்தது.', focusSummary: 'கவனச் சுருக்கம்', focusTime: 'கவன நேரம்', planned: 'திட்டமிட்டது', status: 'நிலை', completed: 'முடிந்தது', cancelled: 'ரத்து செய்யப்பட்டது', task: 'பணி:', anotherSession: 'மற்றொரு அமர்வைத் தொடங்கவும்' },
    plan: { eyebrow: 'திட்டம்', title: 'முக்கியமானவற்றுக்கு இடமளிக்கவும்.', subtitle: 'அடுத்து செய்ய ஒரு பணியை அல்லது இலக்கைத் தேர்ந்தெடுக்கவும்.', tasks: 'பணிகள்', tasksDetail: 'உங்கள் அடுத்த படிகளைத் தெளிவாக வைத்திருங்கள்.', goals: 'இலக்குகள்', goalsDetail: 'நீங்கள் தேர்ந்தெடுத்த இலக்குகளைப் பாருங்கள்.' },
    goals: { eyebrow: 'இலக்குகள்', title: 'உங்கள் திசையைத் தெளிவாக வைத்திருங்கள்.', subtitle: 'அளவிடக்கூடிய ஒரு நோக்கத்தை அமைக்கவும். நீங்கள் தேர்ந்தெடுத்த இலக்கில் கவன நேரமும் முடிக்கப்பட்ட அமர்வுகளும் கணக்கிடப்படும்.', create: 'இலக்கை உருவாக்கவும்', newWeekly: 'புதிய வார இலக்கு', titleLabel: 'இலக்குத் தலைப்பு', titlePlaceholder: 'நீங்கள் எதை அடைய விரும்புகிறீர்கள்?', sessions: 'அமர்வுகள்', focusMinutes: 'கவன நிமிடங்கள்', target: 'இலக்கு', save: 'இலக்கைச் சேமிக்கவும்', cancel: 'ரத்து செய்', yourGoals: 'உங்கள் இலக்குகள்', emptyLabel: 'இலக்குகள் இன்னும் இல்லை', empty: 'நீங்கள் தயாரானபோது ஒரு எளிய இலக்கை உருவாக்கவும்.', loading: 'இலக்குகள் ஏற்றப்படுகின்றன', loadErrorTitle: 'உங்கள் இலக்குகளை ஏற்ற முடியவில்லை.', loadErrorBody: 'சேமித்த இலக்குகள் மாற்றப்படவில்லை. இலக்குகள் மற்றும் முன்னேற்றத்தை மீண்டும் ஏற்ற முயற்சிக்கவும்.', retry: 'இலக்குகளை மீண்டும் ஏற்றவும்', sessionError: 'அமர்வுகளின் முழு எண்ணிக்கையை உள்ளிடவும்.', focusError: 'கவன நேர இலக்கை நிமிடங்களில் சரியாக உள்ளிடவும்.', saveError: 'இந்த இலக்கைச் சேமிக்க முடியவில்லை. ஏற்கனவே உள்ள இலக்குகள் வைக்கப்பட்டுள்ளன; மீண்டும் முயற்சிக்கவும்.', back: 'இலக்குகளுக்குத் திரும்பு' },
    tasks: { eyebrow: 'பணிகள்', title: 'அடுத்து முக்கியமானதைத் தேர்ந்தெடுக்கவும்.', subtitle: 'உங்கள் அடுத்த படிகளைத் தெளிவாகவும் கவனத்திற்குத் தயாராகவும் வைத்திருங்கள்.', add: 'பணியைச் சேர்க்கவும்', newTask: 'புதிய பணி', titleLabel: 'பணி தலைப்பு', placeholder: 'உங்கள் கவனம் எதற்கு தேவை?', save: 'பணியைச் சேமிக்கவும்', cancel: 'ரத்து செய்', upNext: 'அடுத்து', completed: 'முடிந்தவை', archived: 'காப்பகப்படுத்தப்பட்டவை', showArchived: 'காப்பக பணிகளைக் காட்டு', hideArchived: 'காப்பக பணிகளை மறை', loading: 'பணிகள் ஏற்றப்படுகின்றன…', loadError: 'உங்கள் பணிகளை ஏற்ற முடியவில்லை. சேமித்த தரவு மீட்டமைக்கப்படவில்லை.', retry: 'பணிகளை மீண்டும் ஏற்றவும்', saving: 'மாற்றங்கள் சேமிக்கப்படுகின்றன…', saveError: 'மாற்றங்களைச் சேமிக்க முடியவில்லை. உங்கள் பணிப் பட்டியலும் draft-உம் வைக்கப்பட்டுள்ளன. மீண்டும் முயற்சிக்கவும்.', noActive: 'செயலில் உள்ள பணிகள் இல்லை. நீங்கள் தயாரானபோது ஒன்றைச் சேர்க்கவும்.', cleared: 'உங்கள் பணிப் பட்டியலை முடித்துவிட்டீர்கள்.', archivedState: 'காப்பகப்படுத்தப்பட்டது', completedState: 'முடிந்தது', ready: 'கவனத்திற்குத் தயாராக உள்ளது', complete: 'முடிக்கவும்' },
    profile: { eyebrow: 'சுயவிவரம்', title: 'கவனம் உங்களுக்காகச் செயல்படட்டும்.', subtitle: 'உங்கள் விருப்பங்களையும் முன்னேற்றத்தையும் ஒரே அமைதியான இடத்தில் வைத்திருங்கள்.', cardLabel: 'உங்கள் சுயவிவரம்', cardTitle: 'உங்களுக்கேற்ற கவனப் பயிற்சி.', cardDetail: 'உங்கள் கவன விருப்பங்களையும் onboarding பதில்களிலிருந்து உருவான சுயவிவரத்தையும் பாருங்கள்.', review: 'சுயவிவரத்தைப் பாருங்கள்', focusSection: 'உங்கள் கவனம்', history: 'கவன வரலாறு', historyDetail: 'நீங்கள் பாதுகாக்கத் தேர்ந்தெடுத்த நேரத்தைப் பாருங்கள்.', goals: 'இலக்குகள்', goalsDetail: 'அர்த்தமுள்ள முன்னேற்றத்தைத் தெளிவாக வைத்திருங்கள்.', tasks: 'பணிகள்', tasksDetail: 'உங்கள் கவனத்திற்கு தகுதியானதைத் தேர்ந்தெடுக்கவும்.', resources: 'வளங்கள்', resourcesDetail: 'உங்கள் பணிக்கான தனிப்பட்ட குறிப்புகளையும் இணைப்புகளையும் வைத்திருங்கள்.', recovery: 'அமர்வு மீட்பு', recoveryDetail: 'தடைப்பட்ட கவன அமர்வைச் சரிபார்க்கவும்.', preferences: 'விருப்பங்கள்', settings: 'அமைப்புகள்', settingsDetail: 'ஆதரிக்கப்படும் செயலி விருப்பங்களை நிர்வகிக்கவும்.', signedIn: 'உள்நுழைந்துள்ளீர்கள்', offlineAccount: 'இந்தக் கணக்கிற்காக இந்த சாதனம் தனி offline தரவு இடத்தை வைத்திருக்கிறது.', signOut: 'வெளியேறு', signingOut: 'வெளியேறுகிறது…', signOutDetail: 'இந்தச் சாதனத்தின் உள்ளூர் தரவை இது இணைக்கவோ நீக்கவோாது.', signIn: 'உள்நுழைக', signInDetail: 'இந்தச் சாதனத்தில் உங்கள் கணக்கைப் பயன்படுத்த உள்நுழைக.', privateNote: 'பாதுகாப்பான ஒத்திசைவு செயல்படுத்தப்பட்டு சரிபார்க்கப்படும் வரை உங்கள் கணக்கின் கவனத் தரவு இந்தச் சாதனத்திலேயே இருக்கும்.', syncStatus: 'தரவு ஒத்திசைவு நிலை', syncStatusLoading: 'உள்ளூர் நிலுவை மாற்றங்கள் சரிபார்க்கப்படுகின்றன…', syncStatusLocalDetail: 'பாதுகாப்பான கணக்கு ஒத்திசைவு இன்னும் செயலில் இல்லை. உங்கள் தரவு இந்தச் சாதனத்திலேயே இருக்கும்.', syncStatusPendingDetail: 'பாதுகாப்பான ஒத்திசைவுக்காக {count} உள்ளூர் மாற்றங்கள் காத்திருக்கின்றன. உங்கள் தரவு இந்தச் சாதனத்தில் வைக்கப்பட்டுள்ளது.', syncStatusUnavailable: 'உள்ளூர் ஒத்திசைவு நிலையைப் படிக்க முடியவில்லை. சேமித்த தரவு மாற்றப்படவில்லை.' },
    planner: { back: 'முகப்பு', eyebrow: 'என் நாளைத் திட்டமிடு', title: 'முக்கியமானவற்றுடன் தொடங்குங்கள்.', subtitle: 'உங்களிடம் உள்ள பணிகளையும் நேரத்தையும் தேர்ந்தெடுக்கவும். உங்கள் நாளுக்கான எளிய தொடக்கத்தை நாங்கள் பரிந்துரைப்போம்.', timeAvailable: 'கிடைக்கும் நேரம்', availableMinutes: 'கிடைக்கும் நிமிடங்கள்', minutes: 'நிமிடங்கள்', minError: 'திட்டமிட குறைந்தது 25 நிமிடங்களை உள்ளிடவும்.', numberError: 'சிறிய முழு நிமிட எண்ணை உள்ளிடவும்.', breakHint: 'ஒவ்வொரு பரிந்துரையும் குறுகிய இடைவேளைக்கு இடமளிக்கும்.', chooseTasks: 'பணிகளைத் தேர்ந்தெடுக்கவும்', loading: 'உங்கள் பணிகள் ஏற்றப்படுகின்றன…', loadError: 'உங்கள் பணிகளை ஏற்ற முடியவில்லை. சேமித்த பணிகள் மாற்றப்படவில்லை.', retry: 'பணிகளை மீண்டும் ஏற்றவும்', empty: 'முதலில் ஒரு பணியைச் சேர்த்து, பின்னர் திட்டம் உருவாக்க வாருங்கள்.', addTask: 'பணியைச் சேர்க்கவும்', selected: 'தேர்ந்தெடுக்கப்பட்டது', notSelected: 'தேர்ந்தெடுக்கப்படவில்லை', suggest: 'ஒரு திட்டத்தைப் பரிந்துரைக்கவும்', suggestion: 'உங்கள் பரிந்துரை', included: 'உங்கள் பரிந்துரையில் சேர்க்கப்பட்டது', startingPoint: 'தெளிவான தொடக்கப் புள்ளி.', blockDuration: 'கவனம் 25 நிமி · இடைவேளை 5 நிமி', moveEarlier: 'பணியை', moveEarlierSuffix: 'முன்னதாக நகர்த்தவும்', moveLater: 'பணியை', moveLaterSuffix: 'பின்னர் நகர்த்தவும்', start: 'தொடங்கவும்', proposalNote: 'இது ஒரு பரிந்துரை மட்டுமே. உங்கள் பணிகளும் அட்டவணையும் மாற்றப்படவில்லை.', confirmed: 'இந்தத் தேர்வை உறுதிசெய்துள்ளீர்கள். ஒரு பணியைத் தொடங்குவது வழக்கமான கவனச் செயல்முறையைப் பயன்படுத்தும்.', confirm: 'இந்தப் பரிந்துரையை உறுதிசெய்க', adjust: 'தேர்வை மாற்றவும்', saved: 'இந்த உறுதிசெய்யப்பட்ட திட்டம் இந்தச் சாதனத்தில் சேமிக்கப்பட்டது.', saveError: 'இந்தத் திட்டத்தைச் சேமிக்க முடியவில்லை. உங்கள் பணிகள் மாற்றப்படவில்லை; மீண்டும் உறுதிசெய்ய முயற்சிக்கவும்.' },
    resourcesPage: { title: 'வளங்கள்', subtitle: 'தனிப்பட்ட குறிப்புகளையும் HTTPS இணைப்புகளையும் இந்தச் சாதனத்தில் சேமிக்கவும். எதுவும் பதிவேற்றப்படாது.', add: 'வளத்தைச் சேர்க்கவும்', titleInput: 'தலைப்பு', referenceInput: 'குறிப்பு அல்லது HTTPS இணைப்பு', typeReference: 'குறிப்பு', typeLink: 'HTTPS இணைப்பு', save: 'வளத்தைச் சேமிக்கவும்', saving: 'சேமிக்கிறது…', loading: 'உள்ளூர் வளங்கள் ஏற்றப்படுகின்றன…', empty: 'உள்ளூர் வளங்கள் இன்னும் இல்லை.', loadError: 'வளங்களை ஏற்ற முடியவில்லை. எதுவும் மாற்றப்படவில்லை.', saveError: 'வளத்தைச் சேமிக்க அல்லது புதுப்பிக்க முடியவில்லை. வேறு எதுவும் மாற்றப்படவில்லை.', retry: 'மீண்டும் முயற்சிக்கவும்', missing: 'காணவில்லை', markMissing: 'காணவில்லை எனக் குறிக்கவும்', saved: 'இந்தச் சாதனத்தில் சேமிக்கப்பட்டது.', taskSection: 'வளங்கள்', taskSectionDetail: 'தேர்ந்தெடுத்த தனிப்பட்ட குறிப்புகளை இந்தப் பணியுடன் வைத்திருங்கள். எதுவும் பதிவேற்றப்படாது.', taskEmpty: 'உள்ளூர் வளங்கள் இன்னும் இல்லை. Profile → Resources மூலம் ஒன்றைச் சேர்க்கவும்.', link: 'இணைக்கவும்', linked: 'இணைக்கப்பட்டது', linkChangedError: 'இந்த வளம் மாறியுள்ளது அல்லது கிடைக்கவில்லை. பணியை மீண்டும் ஏற்றவும்.', linkUnavailableError: 'வள இணைப்பை மாற்ற முடியவில்லை.' },
    taskDetail: { back: 'பணிகளுக்குத் திரும்பு', loadErrorTitle: 'இந்தப் பணியை ஏற்ற முடியவில்லை.', loadErrorDetail: 'சேமித்த பணிகள் மாற்றப்படவில்லை. மீண்டும் ஏற்ற முயற்சிக்கவும்.', retryLoad: 'பணியை மீண்டும் ஏற்றவும்', unavailableTitle: 'பணி கிடைக்கவில்லை', unavailableDetail: 'இந்தச் சாதனத்தில் இந்தப் பணி கிடைக்கவில்லை.', eyebrow: 'பணி விவரம்', editTitle: 'பணி தலைப்பைத் திருத்தவும்', descriptionPlaceholder: 'குறிப்பைச் சேர்க்கவும் (விருப்பம்)', dueDateLabel: 'கடைசி நாள் (UTC நாட்காட்டி தேதி, விருப்பம்)', blankDateHint: 'வெற்று தேதி என்றால் கடைசி நாள் இல்லை. சாதனங்களுக்கிடையில் தேதி மாறாது.', priorityLabel: 'முன்னுரிமை (விருப்பம்)', goalLabel: 'இலக்கு (விருப்பம்)', loadingGoals: 'உங்கள் இலக்குகள் ஏற்றப்படுகின்றன…', goalsLoadError: 'உங்கள் இலக்குகளை ஏற்ற முடியவில்லை. தற்போதைய இலக்கு இணைப்பு மாறாது; வேறு இலக்கைத் தேர்ந்தெடுக்க மீண்டும் முயற்சிக்கவும்.', retryGoals: 'இலக்குகளை மீண்டும் ஏற்றவும்', noGoal: 'இலக்கு இல்லை', createGoalFirst: 'இந்தப் பணியை இணைக்க முதலில் இலக்கை உருவாக்கவும்.', dueDatePrefix: 'கடைசி நாள்', priorityPrefix: 'முன்னுரிமை', archivedStatus: 'காப்பகப்படுத்தப்பட்டது. இந்தப் பணி செயலில் உள்ள பட்டியல்களில் மறைக்கப்பட்டுள்ளது; கவன வரலாறு பாதுகாக்கப்படுகிறது.', completedStatus: 'முடிந்தது. முக்கியமான பணிக்கு நீங்கள் இடம் உருவாக்கினீர்கள்.', cancelledStatus: 'இந்தப் பணி ரத்து செய்யப்பட்டது.', readyStatus: 'உங்கள் அடுத்த கவனத் தொகுதிக்குத் தயாராக உள்ளது.', pendingSave: 'இந்தப் பணியைச் சேமிக்க முடியவில்லை. அது இன்னும் நிலுவையில் உள்ளது; மீண்டும் முயற்சிக்கவும்.', reload: 'பணியை மீண்டும் ஏற்றவும்', deleteTitle: 'இந்தப் பணியை நீக்கவா?', deleteDetail: 'பணி அகற்றப்படும். கவன அமர்வுகள் வரலாற்றில் இருக்கும்; சூழலுக்காக பணி பெயர் பாதுகாக்கப்படும்.', deleteConfirm: 'வரலாற்றை வைத்து பணியை நீக்கவும்', keepTask: 'பணியை வைத்திருக்கவும்', saveDetails: 'பணி விவரங்களைச் சேமிக்கவும்', cancelEditing: 'திருத்தத்தை ரத்து செய்யவும்', editDetails: 'பணி விவரங்களைத் திருத்தவும்', complete: 'பணியை முடிக்கவும்', focus: 'இந்தப் பணியில் கவனம் செலுத்தவும்', restore: 'பணியை மீட்டெடுக்கவும்', archive: 'பணியை காப்பகப்படுத்தவும்', delete: 'பணியை நீக்கவும்', noPriority: 'முன்னுரிமை இல்லை', low: 'குறைவு', medium: 'நடுத்தரம்', high: 'அதிகம்' },
    settingsPage: { back: 'சுயவிவரம்', eyebrow: 'அமைப்புகள்', title: 'அமைதியான இயல்புநிலையை அமைக்கவும்.', subtitle: 'Deep Focus உங்கள் கவனத்திற்கு எவ்வாறு உதவ வேண்டும் என்பதைத் தேர்ந்தெடுக்கவும்.', loading: 'சேமித்த அமைப்புகள் ஏற்றப்படுகின்றன…', loadErrorTitle: 'உங்கள் அமைப்புகள் மாற்றப்படவில்லை.', loadErrorDetail: 'சேமித்த விருப்பங்களைப் படிக்க முடியவில்லை. எந்த இயல்புநிலையும் மேலெழுதப்படவில்லை.', retry: 'மீண்டும் முயற்சிக்கவும்', focusSection: 'கவனம்', focusDuration: 'இயல்புநிலை கவன நேரம்', focusHint: 'புதிய கவன அமர்வுகளுக்குப் பயன்படுத்தப்படும். சேமித்த பிறகு மாற்றங்கள் உறுதிசெய்யப்படும்.', saving: 'உங்கள் தேர்வு சேமிக்கப்படுகிறது…', breakDuration: 'இயல்புநிலை இடைவேளை நேரம்', breakHint: 'எதிர்கால இடைவேளைகளுக்குப் பயன்படுத்தப்படும். சேமித்த பிறகு மாற்றங்கள் உறுதிசெய்யப்படும்.', saveError: 'உங்கள் மாற்றம் சேமிக்கப்படவில்லை. முந்தைய தேர்வு இன்னும் தேர்ந்தெடுக்கப்பட்டுள்ளது. மீண்டும் முயற்சிக்கவும்.', appearanceSection: 'தோற்றம் மற்றும் அணுகல்தன்மை', appearance: 'தோற்றம்', systemTheme: 'கணினி · உங்கள் சாதனத் தோற்றத்தைப் பின்பற்றுகிறது', reducedMotion: 'குறைந்த இயக்கம்', reducedMotionDetail: 'உங்கள் சாதன அணுகல்தன்மை விருப்பத்தைப் பின்பற்றுகிறது', languageDetailSuffix: 'முழு மொழிபெயர்ப்பு மற்றும் அணுகல்தன்மை மதிப்பாய்வு இன்னும் நிலுவையில் உள்ளது.', notificationsSection: 'அறிவிப்புகள் மற்றும் பின்னூட்டம்', notifications: 'அறிவிப்புகள்', notificationsDetail: 'அறிவிப்பு திட்டமிடல் இன்னும் அமைக்கப்படவில்லை', sound: 'ஒலி மற்றும் தொடு பின்னூட்டம்', soundDetail: 'அமர்வு பின்னூட்டத்துடன் கட்டுப்பாடுகள் கிடைக்கும்', privacySection: 'தனியுரிமை மற்றும் கணக்கு', localFirst: 'உள்ளூர் முதன்மை தரவு', localFirstDetail: 'ஒத்திசைவு அமைக்கப்படாத வரை உங்கள் கவன அமர்வுகள் இந்தச் சாதனத்தில் இருக்கும்.', account: 'கணக்கு', accountDetail: 'கணக்கு அணுகல் கிடைக்கும்போது உள்நுழையவும்' },
    onboarding: { intro: { back: 'வரவேற்புக்கு', title: 'உங்களுக்குப் பொருந்தும் கவனப் பழக்கத்தை உருவாக்குங்கள்.', subtitle: 'அழுத்தம் சேர்க்காமல் Deep Focus அனுபவத்தைப் பயனுள்ளதாக மாற்ற சில சிந்தனையான கேள்விகள் உதவும்.', stepOneTitle: 'உதவும் விஷயங்களைப் பகிருங்கள்', stepOneDetail: 'உங்கள் விருப்பமான வேகம் மற்றும் கவனச் சூழலைப் பற்றி கூறுங்கள்.', stepTwoTitle: 'உங்கள் அமைப்பை வடிவமைக்கவும்', stepTwoDetail: 'எதுவும் பயன்படுத்தப்படுவதற்கு முன் பரிந்துரைகளை மதிப்பாய்வு செய்யுங்கள்.', stepThreeTitle: 'மெதுவாகத் தொடங்குங்கள்', stepThreeDetail: 'நீங்கள் தயாரானதும் அமைதியான நம்பகமான அமர்வைத் தொடங்குங்கள்.', start: 'தனிப்பட்ட மதிப்பீட்டைத் தொடங்கவும்', skip: 'இப்போதைக்கு தவிர்க்கவும்', privacy: 'கட்டுப்பாடு உங்களிடமே இருக்கும். உங்கள் பதில்கள் பரிந்துரைகள் மட்டுமே; உறுதிமொழிகள் அல்ல.' }, assessment: { backOnboarding: 'Onboarding', previous: 'முந்தைய கேள்வி', eyebrow: 'தனிப்பட்ட மதிப்பீடு', title: 'உங்கள் வேகத்தில் சில கேள்விகள்.', subtitle: 'தவறான பதில்கள் இல்லை. உங்களுக்குச் சரியாகத் தோன்றுவதைத் தேர்ந்தெடுக்கவும் அல்லது திரும்பிச் செல்லவும்.', loading: 'சேமித்த பதில்கள் ஏற்றப்படுகின்றன…', error: 'உங்கள் பதிலைச் சேமிக்க முடியவில்லை. உங்கள் தேர்வு காட்டப்படுகிறது. தயாரானதும் மீண்டும் முயற்சிக்கவும்.', choices: 'பதில் தேர்வுகள்', viewProfile: 'என் சுயவிவரத்தைப் பார்க்கவும்', next: 'அடுத்த கேள்வி', retry: 'பதிலை மீண்டும் சேமிக்கவும்', skip: 'மதிப்பீட்டைத் தவிர்க்கவும்', privacy: 'உங்கள் மதிப்பாய்வுக்கான பரிந்துரைகளைத் தயாரிக்க உங்கள் பதில்கள் பயன்படுத்தப்படும்.' }, profile: { back: 'மதிப்பீட்டிற்கு திரும்பு', eyebrow: 'உங்கள் சுயவிவரம்', title: 'உங்கள் தொடக்க நிலை.', noAnswers: 'உங்கள் விருப்பங்கள் சேகரிக்கப்படவில்லை.', noAnswersDetail: 'விருப்ப மதிப்பீட்டைத் தொடங்கலாம் அல்லது செயலியின் இயல்புநிலை அமைப்புகளுடன் தொடரலாம்.', start: 'தனிப்பட்ட மதிப்பீட்டைத் தொடங்கவும்', continueDefaults: 'இயல்புநிலைகளுடன் தொடரவும்', subtitle: 'இந்த மதிப்பீட்டிற்காக நீங்கள் பகிர்ந்த தேர்வுகள் இவை. இவை நீண்டகால முடிவுகள் அல்ல.', shared: 'நீங்கள் பகிர்ந்தது', sharedDetail: 'இந்த மதிப்பீட்டிற்கான உங்கள் தேர்வு', suggestions: 'மதிப்பாய்வு செய்ய வேண்டிய பரிந்துரைகள்', suggestionDetail: 'விருப்பமான தொடக்க யோசனை; எதுவும் பயன்படுத்தப்படவில்லை', saved: 'இந்தச் சாதனத்தில் சேமிக்கப்பட்டது', savedDetail: 'இந்தச் செயல்முறையை மீட்டெடுக்க உங்கள் பதில்கள் உள்ளூர் தரவுத்தளத்தில் சேமிக்கப்படும். உறுதிப்படுத்திய பிறகே பரிந்துரைகள் பயன்படுத்தப்படும்.', saving: 'உங்கள் சமீபத்திய தேர்வு சேமிக்கப்படுகிறது…', saveError: 'உங்கள் சமீபத்திய தேர்வைச் சேமிக்க முடியவில்லை. சேமித்த பதிப்பு பாதுகாக்கப்பட்டுள்ளது. மீண்டும் முயற்சிக்கலாம்.', retry: 'பதிலை மீண்டும் சேமிக்கவும்', review: 'பயன்படுத்துவதற்கு முன் மதிப்பாய்வு செய்யவும்', reviewDetail: 'இது எதிர்கால கவன நேரத்தை {focus} நிமிடங்களாகவும் இடைவேளையை {break} நிமிடங்களாகவும் அமைக்கும். இருக்கும் பணிகள் அல்லது இயங்கும் அமர்வு மாறாது.', applied: 'உங்கள் உள்ளூர் அமைப்புகளில் பயன்படுத்தப்பட்டது.', applyError: 'பரிந்துரையைப் பயன்படுத்த முடியவில்லை. முந்தைய அமைப்புகள் மாற்றப்படவில்லை. மீண்டும் முயற்சிக்கவும்.', apply: 'பரிந்துரைகளை என் அமைப்புகளில் பயன்படுத்தவும்', appliedButton: 'அமைப்புகள் பயன்படுத்தப்பட்டன', startFocus: 'கவன அமர்வைத் தொடங்கவும்', useDefaults: 'செயலியின் இயல்புநிலை அமைப்புகளைப் பயன்படுத்தவும்' } },
  },
};

export function getAppLocaleCopy(locale: AppLocale): AppLocaleCopy {
  const base = COPY[locale] ?? COPY.en;
  return {
    ...base,
    signIn: { ...base.signIn, ...SIGN_IN_VALIDATION_COPY[locale] ?? SIGN_IN_VALIDATION_COPY.en },
    recovery: { ...base.recovery, ...RECOVERY_OUTCOME_COPY[locale] ?? RECOVERY_OUTCOME_COPY.en },
  };
}
