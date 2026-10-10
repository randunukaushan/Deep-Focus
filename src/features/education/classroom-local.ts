// @ts-expect-error The bundled domain test runner imports TypeScript modules directly.
import { canAcceptInvite, type ClassroomAccessContext, type ClassroomInvite } from './classroom-policy.ts';

export type ClassroomAssignment = {
  assignmentId: string;
  classId: string;
  title: string;
  instructions: string;
  deadline?: string;
  revision: number;
};

export type PrivateAssignmentTask = {
  taskId: string;
  assignmentId: string;
  title: string;
  instructions: string;
  deadline?: string;
};

export type ProgressShare = {
  assignmentId: string;
  revision: number;
  completion: 'not_started' | 'in_progress' | 'completed';
};

export type TeacherFeedback = {
  assignmentId: string;
  revision: number;
  message: string;
};

export type AssignmentResult =
  | { accepted: true; task: PrivateAssignmentTask }
  | { accepted: false; reason: 'invite_denied' | 'not_confirmed' | 'invalid_assignment' };

const MAX_TEXT = 240;

function validText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_TEXT && !/[\u0000-\u001f\u007f]/.test(value);
}

function validAssignment(assignment: ClassroomAssignment): boolean {
  return typeof assignment.assignmentId === 'string' && assignment.assignmentId.length > 0
    && typeof assignment.classId === 'string' && assignment.classId.length > 0
    && validText(assignment.title) && validText(assignment.instructions)
    && Number.isSafeInteger(assignment.revision) && assignment.revision > 0
    && (assignment.deadline === undefined || (typeof assignment.deadline === 'string' && Number.isFinite(Date.parse(assignment.deadline))));
}

/** Maps an accepted assignment to a learner-owned task without copying class content or history. */
export function acceptAssignment(
  invite: ClassroomInvite | null,
  assignment: ClassroomAssignment,
  now: string,
  context: ClassroomAccessContext,
  policyVersion: number,
  confirmed: boolean,
): AssignmentResult {
  if (!validAssignment(assignment) || !invite || invite.classId !== assignment.classId) return { accepted: false, reason: 'invalid_assignment' };
  if (!canAcceptInvite(invite, now, context, policyVersion)) return { accepted: false, reason: 'invite_denied' };
  if (!confirmed) return { accepted: false, reason: 'not_confirmed' };
  return {
    accepted: true,
    task: {
      taskId: `classroom:${assignment.assignmentId}:${assignment.revision}`,
      assignmentId: assignment.assignmentId,
      title: assignment.title.trim(),
      instructions: assignment.instructions.trim(),
      ...(assignment.deadline === undefined ? {} : { deadline: assignment.deadline }),
    },
  };
}

/** Builds only the learner-selected progress state; it never includes focus history or private notes. */
export function selectProgressShare(assignment: ClassroomAssignment, completion: ProgressShare['completion']): ProgressShare | null {
  if (!validAssignment(assignment) || !['not_started', 'in_progress', 'completed'].includes(completion)) return null;
  return { assignmentId: assignment.assignmentId, revision: assignment.revision, completion };
}

/** Prepares bounded teacher feedback only for the current assignment revision. */
export function prepareTeacherFeedback(
  assignment: ClassroomAssignment,
  role: 'teacher' | 'learner',
  targetRevision: number,
  message: string,
): TeacherFeedback | null {
  if (!validAssignment(assignment) || role !== 'teacher' || targetRevision !== assignment.revision || !validText(message) || message.length > 500) return null;
  return { assignmentId: assignment.assignmentId, revision: assignment.revision, message: message.trim() };
}
