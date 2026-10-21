export const ASSESSMENT_VERSION = '1.0.0';

export const ASSESSMENT_QUESTIONS = [
  {
    id: 'focus_time',
    prompt: 'When would you like to make room for focus?',
    options: [
      { id: 'morning', label: 'Earlier in the day' },
      { id: 'afternoon', label: 'In the afternoon' },
      { id: 'evening', label: 'In the evening' },
      { id: 'flexible', label: 'It changes from day to day' },
    ],
  },
  {
    id: 'focus_pace',
    prompt: 'What kind of focus block sounds useful right now?',
    options: [
      { id: 'short', label: 'Short blocks with room to reset' },
      { id: 'steady', label: 'A steady, familiar block' },
      { id: 'long', label: 'A longer quiet block' },
      { id: 'exploring', label: 'I am still exploring' },
    ],
  },
  {
    id: 'break_style',
    prompt: 'How would you like breaks to fit in?',
    options: [
      { id: 'brief', label: 'A brief pause between blocks' },
      { id: 'unhurried', label: 'A little more breathing room' },
      { id: 'flexible', label: 'I would rather decide each time' },
      { id: 'unsure', label: 'I am not sure yet' },
    ],
  },
  {
    id: 'environment',
    prompt: 'What kind of setting usually feels comfortable for focus?',
    options: [
      { id: 'quiet', label: 'A quiet space' },
      { id: 'background', label: 'Some gentle background sound' },
      { id: 'varies', label: 'It depends on the day' },
      { id: 'unsure', label: 'I am still finding out' },
    ],
  },
  {
    id: 'starting_support',
    prompt: 'What helps you begin a task?',
    options: [
      { id: 'next_step', label: 'Knowing one clear next step' },
      { id: 'planned_block', label: 'Having a block of time set aside' },
      { id: 'gentle_prompt', label: 'A gentle reminder when I choose one' },
      { id: 'quiet_start', label: 'Starting without extra prompts' },
    ],
  },
  {
    id: 'common_distraction',
    prompt: 'What can make it harder to stay with a task?',
    options: [
      { id: 'notifications', label: 'Notifications or nearby devices' },
      { id: 'unclear_task', label: 'Not knowing where to start' },
      { id: 'surroundings', label: 'Activity around me' },
      { id: 'varies', label: 'It varies; no single thing' },
    ],
  },
  {
    id: 'current_focus',
    prompt: 'What would you like to make space for these days?',
    options: [
      { id: 'learning', label: 'Learning or study' },
      { id: 'projects', label: 'A project or planned task' },
      { id: 'creative', label: 'Creative work' },
      { id: 'daily_rhythm', label: 'A calmer daily rhythm' },
    ],
  },
] as const;

export type AssessmentQuestionId = typeof ASSESSMENT_QUESTIONS[number]['id'];
export type AssessmentAnswers = Partial<Record<AssessmentQuestionId, string>>;
export type AssessmentProfile = {
  version: string;
  sharedPreferences: { questionId: AssessmentQuestionId; label: string; value: string }[];
  suggestions: { title: string; text: string }[];
  note: string;
};

export function isSupportedAssessmentAnswers(value: unknown): value is AssessmentAnswers {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.entries(value as Record<string, unknown>).every(([questionId, answer]) => {
    const question = ASSESSMENT_QUESTIONS.find((item) => item.id === questionId);
    if (!question || typeof answer !== 'string') return false;
    return question.options.some((option) => option.id === answer);
  });
}

export function isCompleteAssessmentAnswers(value: unknown): value is Record<AssessmentQuestionId, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const answers = value as Record<string, unknown>;
  if (Object.keys(answers).length !== ASSESSMENT_QUESTIONS.length) return false;
  return ASSESSMENT_QUESTIONS.every((question) => {
    const answer = answers[question.id];
    return typeof answer === 'string' && question.options.some((option) => option.id === answer);
  });
}

export function buildAssessmentProfile(answers: unknown): AssessmentProfile | null {
  if (!isCompleteAssessmentAnswers(answers)) return null;
  const sharedPreferences: AssessmentProfile['sharedPreferences'] = [];
  for (const question of ASSESSMENT_QUESTIONS) {
    const selected = question.options.find((option) => option.id === answers[question.id]);
    if (!selected) return null;
    sharedPreferences.push({ questionId: question.id, label: question.prompt, value: selected.label });
  }
  const choice = (id: AssessmentQuestionId) => sharedPreferences.find((item) => item.questionId === id)?.value ?? '';
  return {
    version: ASSESSMENT_VERSION,
    sharedPreferences,
    suggestions: [
      { title: 'Focus rhythm', text: `Try a focus session ${choice('focus_time').toLowerCase()}, when it fits your day.` },
      { title: 'Getting started', text: `You chose: ${choice('starting_support').toLowerCase()}.` },
      { title: 'Your current focus', text: `You would like to make space for ${choice('current_focus').toLowerCase()}.` },
    ],
    note: 'These are suggestions from the choices you made today. They are not a diagnosis or a proven pattern, and nothing has been changed in your settings.',
  };
}
