import type { EducationMetadata } from './education-metadata.ts';

export type TeacherAssignmentDraft = {
  assignmentId: string;
  classId: string;
  title: string;
  instructions: string;
  deadline?: string;
  revision: number;
  education?: EducationMetadata;
};

export type TeacherAssignmentDraftResult =
  | { valid: true; draft: TeacherAssignmentDraft }
  | { valid: false; reason: 'invalid_identity' | 'invalid_text' | 'invalid_deadline' | 'invalid_metadata' };

const MAX_TEXT = 240;

function boundedText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_TEXT && !/[\u0000-\u001f\u007f]/.test(value);
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function validateIdentity(assignmentId: unknown, classId: unknown): boolean {
  return typeof assignmentId === 'string' && assignmentId.trim().length > 0 && assignmentId.length <= 120
    && typeof classId === 'string' && classId.trim().length > 0 && classId.length <= 120;
}

function validateMetadata(value: unknown): value is EducationMetadata | undefined {
  if (value === undefined) return true;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const metadata = value as Record<string, unknown>;
  return metadata.country === 'LK' && ['ol', 'al', 'higher'].includes(String(metadata.stage));
}

/** Creates a local teacher draft only; it never creates a class or sends an invite. */
export function createTeacherAssignmentDraft(input: unknown): TeacherAssignmentDraftResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { valid: false, reason: 'invalid_identity' };
  const candidate = input as Record<string, unknown>;
  if (!validateIdentity(candidate.assignmentId, candidate.classId)) return { valid: false, reason: 'invalid_identity' };
  if (!boundedText(candidate.title) || !boundedText(candidate.instructions)) return { valid: false, reason: 'invalid_text' };
  if (candidate.deadline !== undefined && !validDate(candidate.deadline)) return { valid: false, reason: 'invalid_deadline' };
  if (!validateMetadata(candidate.education)) return { valid: false, reason: 'invalid_metadata' };
  const revisionValue = candidate.revision === undefined ? 1 : candidate.revision;
  if (typeof revisionValue !== 'number' || !Number.isSafeInteger(revisionValue) || revisionValue < 1) return { valid: false, reason: 'invalid_identity' };
  return {
    valid: true,
    draft: {
      assignmentId: (candidate.assignmentId as string).trim(),
      classId: (candidate.classId as string).trim(),
      title: (candidate.title as string).trim(),
      instructions: (candidate.instructions as string).trim(),
      ...(candidate.deadline === undefined ? {} : { deadline: candidate.deadline as string }),
      revision: revisionValue,
      ...(candidate.education === undefined ? {} : { education: candidate.education as EducationMetadata }),
    },
  };
}

/** Revises the same local draft and increments its revision for stale-write detection. */
export function reviseTeacherAssignmentDraft(previous: TeacherAssignmentDraft, changes: Pick<TeacherAssignmentDraft, 'title' | 'instructions' | 'deadline' | 'education'>): TeacherAssignmentDraftResult {
  return createTeacherAssignmentDraft({ ...previous, ...changes, revision: previous.revision + 1 });
}
