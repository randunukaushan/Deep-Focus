import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { ASSESSMENT_VERSION, isSupportedAssessmentAnswers, type AssessmentAnswers } from './assessment-definition';
import { cancelAssessment, loadAssessment, saveAssessmentDraft } from './assessment-storage';

const ASSESSMENT_ID = 'personal-assessment-v1';
type FlowState = 'loading' | 'ready' | 'saving' | 'error';

const AssessmentFlowContext = createContext<{
  answers: AssessmentAnswers;
  setAnswers(value: AssessmentAnswers): void;
  clearAnswers(): void;
  flowState: FlowState;
  errorMessage: string | null;
  retryPersistence(): void;
} | null>(null);

export function AssessmentFlowProvider({ children }: React.PropsWithChildren) {
  const [answers, setAnswersState] = useState<AssessmentAnswers>({});
  const [flowState, setFlowState] = useState<FlowState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedAtRef = useRef(new Date().toISOString());
  const revisionRef = useRef<string | null>(null);
  const queueRef = useRef(Promise.resolve());
  const mountedRef = useRef(true);

  const enqueue = useCallback((work: () => Promise<void>) => {
    queueRef.current = queueRef.current.catch(() => undefined).then(work);
  }, []);

  const persist = useCallback((nextAnswers: AssessmentAnswers) => {
    enqueue(async () => {
      if (mountedRef.current) { setFlowState('saving'); setErrorMessage(null); }
      try {
        const revision = await saveAssessmentDraft({ id: ASSESSMENT_ID, version: ASSESSMENT_VERSION, startedAt: startedAtRef.current, answers: nextAnswers }, revisionRef.current);
        if (revision === null) throw new Error('ASSESSMENT_SAVE_CONFLICT: saved draft changed elsewhere');
        revisionRef.current = revision;
        if (mountedRef.current) setFlowState('ready');
      } catch (error) {
        if (mountedRef.current) { setFlowState('error'); setErrorMessage(error instanceof Error && error.message.includes('CONFLICT') ? 'ASSESSMENT_SAVE_CONFLICT' : 'ASSESSMENT_SAVE_FAILED'); }
      }
    });
  }, [enqueue]);

  useEffect(() => {
    mountedRef.current = true;
    void (async () => {
      try {
        const saved = await loadAssessment(ASSESSMENT_ID);
        if (!mountedRef.current) return;
        if (saved && (saved.status === 'in_progress' || saved.status === 'completed')) {
          if (!isSupportedAssessmentAnswers(saved.answers)) throw new Error('ASSESSMENT_DATA_UNAVAILABLE: unsupported saved answer');
          setAnswersState(saved.answers);
          startedAtRef.current = saved.startedAt;
          revisionRef.current = saved.updatedAt;
        }
        setFlowState('ready');
      } catch {
        if (!mountedRef.current) return;
        setFlowState('error');
        setErrorMessage('ASSESSMENT_LOAD_FAILED');
      }
    })();
    return () => { mountedRef.current = false; };
  }, []);

  const setAnswers = useCallback((value: AssessmentAnswers) => {
    if (!isSupportedAssessmentAnswers(value)) { setFlowState('error'); setErrorMessage('ASSESSMENT_INVALID: unsupported answer'); return; }
    setAnswersState(value);
    persist(value);
  }, [persist]);

  const clearAnswers = useCallback(() => {
    setAnswersState({});
    enqueue(async () => {
      const expected = revisionRef.current;
      if (expected === null) { if (mountedRef.current) setFlowState('ready'); return; }
      try {
        await cancelAssessment(ASSESSMENT_ID, expected);
        revisionRef.current = null;
        if (mountedRef.current) { setFlowState('ready'); setErrorMessage(null); }
      } catch {
        if (mountedRef.current) { setFlowState('error'); setErrorMessage('ASSESSMENT_CANCEL_FAILED'); }
      }
    });
  }, [enqueue]);

  const retryPersistence = useCallback(() => { if (Object.keys(answers).length > 0) persist(answers); }, [answers, persist]);

  return <AssessmentFlowContext.Provider value={{ answers, setAnswers, clearAnswers, flowState, errorMessage, retryPersistence }}>{children}</AssessmentFlowContext.Provider>;
}

export function useAssessmentFlow() {
  const value = useContext(AssessmentFlowContext);
  if (!value) throw new Error('useAssessmentFlow must be within onboarding routes');
  return value;
}
