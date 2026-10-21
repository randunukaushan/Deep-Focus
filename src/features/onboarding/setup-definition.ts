/** Version 2: language is saved first; four optional questions propose real settings. */
export const SETUP_VERSION = '2.0.0';
export const SETUP_STEPS = ['language', 'focus_duration', 'break_duration', 'appearance', 'motion'] as const;
export const SETUP_QUESTIONS = [
  { id: 'focus_duration', options: ['25', '45', '60', 'keep'] },
  { id: 'break_duration', options: ['5', '10', '15', 'keep'] },
  { id: 'appearance', options: ['system', 'light', 'dark', 'keep'] },
  { id: 'motion', options: ['system', 'reduced', 'keep'] },
] as const;

export type SetupQuestionId = typeof SETUP_QUESTIONS[number]['id'];
export type SetupAnswers = Partial<Record<SetupQuestionId, string>>;
export type SetupPreferences = {
  defaultFocusDurationMinutes: 25 | 45 | 60;
  defaultBreakDurationMinutes: 5 | 10 | 15;
  appearance: 'system' | 'light' | 'dark';
  reduceMotion: boolean;
};
export type SetupField = keyof SetupPreferences;
export type SetupChange = { [K in SetupField]: { field: K; before: SetupPreferences[K]; after: SetupPreferences[K] } }[SetupField];

function plainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function validSetupAnswers(value: unknown): value is SetupAnswers {
  if (!plainRecord(value)) return false;
  return Object.entries(value).every(([id, option]) => {
    const question = SETUP_QUESTIONS.find(question => question.id === id);
    return !!question && typeof option === 'string' && question.options.some(allowed => allowed === option);
  });
}

export function validSetupPatch(value: unknown): value is Partial<SetupPreferences> {
  if (!plainRecord(value)) return false;
  return Object.entries(value).every(([key, option]) => {
    switch (key) {
      case 'defaultFocusDurationMinutes': return [25, 45, 60].includes(option as number);
      case 'defaultBreakDurationMinutes': return [5, 10, 15].includes(option as number);
      case 'appearance': return ['system', 'light', 'dark'].includes(option as string);
      case 'reduceMotion': return typeof option === 'boolean';
      default: return false;
    }
  });
}

export function validSetupPreferences(value: unknown): value is SetupPreferences {
  return validSetupPatch(value) && Object.keys(value).length === 4;
}

/** Missing/keep answers intentionally propose nothing, not an invented default. */
export function setupProposal(answers: SetupAnswers): Partial<SetupPreferences> {
  if (!validSetupAnswers(answers)) throw new RangeError('INVALID_SETUP_ANSWERS');
  const patch: Partial<SetupPreferences> = {};
  if (answers.focus_duration && answers.focus_duration !== 'keep') patch.defaultFocusDurationMinutes = Number(answers.focus_duration) as 25 | 45 | 60;
  if (answers.break_duration && answers.break_duration !== 'keep') patch.defaultBreakDurationMinutes = Number(answers.break_duration) as 5 | 10 | 15;
  if (answers.appearance && answers.appearance !== 'keep') patch.appearance = answers.appearance as SetupPreferences['appearance'];
  if (answers.motion && answers.motion !== 'keep') patch.reduceMotion = answers.motion === 'reduced';
  return patch;
}

export function setupReview(answers: SetupAnswers, current: SetupPreferences): SetupChange[] {
  if (!validSetupPreferences(current)) throw new RangeError('INVALID_SETUP_PREFERENCES');
  const proposal = setupProposal(answers);
  // Construct each discriminated row explicitly, so review values cannot cross fields.
  const rows: SetupChange[] = [];
  if (proposal.defaultFocusDurationMinutes !== undefined && proposal.defaultFocusDurationMinutes !== current.defaultFocusDurationMinutes) rows.push({ field: 'defaultFocusDurationMinutes', before: current.defaultFocusDurationMinutes, after: proposal.defaultFocusDurationMinutes });
  if (proposal.defaultBreakDurationMinutes !== undefined && proposal.defaultBreakDurationMinutes !== current.defaultBreakDurationMinutes) rows.push({ field: 'defaultBreakDurationMinutes', before: current.defaultBreakDurationMinutes, after: proposal.defaultBreakDurationMinutes });
  if (proposal.appearance !== undefined && proposal.appearance !== current.appearance) rows.push({ field: 'appearance', before: current.appearance, after: proposal.appearance });
  if (proposal.reduceMotion !== undefined && proposal.reduceMotion !== current.reduceMotion) rows.push({ field: 'reduceMotion', before: current.reduceMotion, after: proposal.reduceMotion });
  return rows;
}

/** Re-derive from answers + reviewed baseline; never accept arbitrary UI values. */
export function selectedSetupPatch(answers: SetupAnswers, current: SetupPreferences, selected: readonly SetupField[]): Partial<SetupPreferences> {
  const rows = setupReview(answers, current);
  if (new Set(selected).size !== selected.length || selected.some(field => !rows.some(row => row.field === field))) throw new RangeError('INVALID_SETUP_SELECTION');
  return Object.fromEntries(rows.filter(row => selected.includes(row.field)).map(row => [row.field, row.after]));
}

/** A retry of an already committed value is safe; a different concurrent edit is not. */
export function setupPatchConflicts(current: SetupPreferences, expected: SetupPreferences, patch: Partial<SetupPreferences>): boolean {
  if (!validSetupPreferences(current) || !validSetupPreferences(expected) || !validSetupPatch(patch)) throw new RangeError('INVALID_SETUP_PREFERENCES');
  return (Object.keys(patch) as SetupField[]).some(field => current[field] !== expected[field] && current[field] !== patch[field]);
}
