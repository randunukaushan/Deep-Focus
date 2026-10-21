import {
  SETUP_QUESTIONS, SETUP_VERSION, selectedSetupPatch, validSetupAnswers,
  type SetupAnswers, type SetupField, type SetupPreferences, type SetupQuestionId,
} from './setup-definition';

type Attempt = { id: string; startedAt: string; updatedAt: string };
export type SetupDraft = Attempt & { answers: unknown };
export type SetupStorage = {
  loadLatestSetupDraft(): Promise<SetupDraft | null>;
  loadSetupPreferences(): Promise<SetupPreferences>;
  saveAssessmentDraft(draft: { id: string; version: string; startedAt: string; answers: SetupAnswers }, expected: string | null): Promise<string | null>;
  applySetupPreferences(expected: SetupPreferences, patch: Partial<SetupPreferences>, attempt?: { id: string; updatedAt: string }): Promise<SetupPreferences>;
};
export type SetupFlowState = {
  status: 'loading' | 'ready' | 'saving' | 'error' | 'applied';
  error: 'load' | 'save' | 'conflict' | 'apply' | null;
  answers: SetupAnswers;
  current: SetupPreferences | null;
  questionIndex: number;
};

/** An instance is bound to one owner store and disposed with its React owner key. */
export function createSetupFlow(storage: SetupStorage, identity: () => { id: string; startedAt: string }) {
  let state: SetupFlowState = { status: 'loading', error: null, answers: {}, current: null, questionIndex: 0 };
  let attempt: Attempt | null = null;
  let unsavedIdentity: ReturnType<typeof identity> | null = null;
  let active = true;
  let locked = false;
  let retryAction: (() => Promise<boolean>) | null = null;
  const listeners = new Set<(value: SetupFlowState) => void>();
  const publish = (value: SetupFlowState) => { if (active) { state = value; listeners.forEach(listener => listener(value)); } };

  async function load(): Promise<boolean> {
    if (!active || locked) return false;
    locked = true;
    publish({ ...state, status: 'loading', error: null });
    try {
      // Invoke both bound methods before awaiting; no global owner lookup after a wait.
      const [draft, current] = await Promise.all([storage.loadLatestSetupDraft(), storage.loadSetupPreferences()]);
      if (!active) return false;
      const answers = draft?.answers ?? {};
      if (!validSetupAnswers(answers)) throw new Error('INVALID_SETUP_DRAFT');
      attempt = draft ? { id: draft.id, startedAt: draft.startedAt, updatedAt: draft.updatedAt } : null;
      unsavedIdentity = null;
      const first = SETUP_QUESTIONS.findIndex(question => answers[question.id] === undefined);
      publish({ status: 'ready', error: null, answers: { ...answers }, current, questionIndex: first < 0 ? SETUP_QUESTIONS.length - 1 : first });
      retryAction = null;
      return true;
    } catch {
      publish({ ...state, status: 'error', error: 'load' });
      retryAction = load;
      return false;
    } finally { locked = false; }
  }

  async function save(answers: SetupAnswers): Promise<boolean> {
    if (!active || locked || !state.current) return false;
    locked = true;
    publish({ ...state, status: 'saving', error: null, answers: { ...answers } });
    try {
      const draft = attempt ?? (unsavedIdentity ??= identity());
      const revision = await storage.saveAssessmentDraft({ ...draft, version: SETUP_VERSION, answers: { ...answers } }, attempt?.updatedAt ?? null);
      if (!active) return false;
      if (revision === null) {
        // Never repeat a stale write against the same revision; re-read explicitly.
        publish({ ...state, status: 'error', error: 'conflict' });
        retryAction = load;
        return false;
      }
      attempt = { id: draft.id, startedAt: draft.startedAt, updatedAt: revision };
      unsavedIdentity = null;
      publish({ ...state, status: 'ready', error: null });
      retryAction = null;
      return true;
    } catch {
      publish({ ...state, status: 'error', error: 'save' });
      retryAction = () => save(answers);
      return false;
    } finally { locked = false; }
  }

  async function answer(id: SetupQuestionId, option: string) {
    if (!active || locked || state.status !== 'ready') return false;
    const answers = { ...state.answers, [id]: option };
    if (!validSetupAnswers(answers)) return false;
    return save(answers);
  }

  async function apply(selected: readonly SetupField[]): Promise<boolean> {
    if (!active || locked || state.status !== 'ready' || !state.current) return false;
    // Validate and snapshot the exact selected review before any asynchronous work.
    const patch = selectedSetupPatch(state.answers, state.current, selected);
    const expected = { ...state.current };
    const reviewed = attempt ? { id: attempt.id, updatedAt: attempt.updatedAt } : undefined;
    locked = true;
    publish({ ...state, status: 'saving', error: null });
    try {
      const current = await storage.applySetupPreferences(expected, patch, reviewed);
      if (!active) return false;
      publish({ ...state, status: 'applied', error: null, current });
      retryAction = null;
      return true;
    } catch (error) {
      const conflict = error instanceof Error && error.message.includes('CONFLICT');
      publish({ ...state, status: 'error', error: conflict ? 'conflict' : 'apply' });
      // Apply retries first return to review; they never secretly repeat confirmation.
      retryAction = conflict ? load : async () => { if (!active) return false; publish({ ...state, status: 'ready', error: null }); return true; };
      return false;
    } finally { locked = false; }
  }

  return {
    getState: () => state,
    subscribe(listener: (value: SetupFlowState) => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    load, answer, apply,
    ensureDraft: () => state.status === 'ready' ? save(state.answers) : Promise.resolve(false),
    retry: () => retryAction?.() ?? Promise.resolve(false),
    move(index: number) {
      if (!active || locked || state.status !== 'ready' || !Number.isInteger(index) || index < 0 || index >= SETUP_QUESTIONS.length) return false;
      publish({ ...state, questionIndex: index });
      return true;
    },
    dispose() { active = false; listeners.clear(); retryAction = null; },
  };
}
