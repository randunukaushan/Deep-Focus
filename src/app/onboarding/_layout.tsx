import { Slot } from 'expo-router';

import { AssessmentFlowProvider } from '@/features/assessment/assessment-flow-context';

export default function OnboardingLayout() {
  return <AssessmentFlowProvider><Slot /></AssessmentFlowProvider>;
}
