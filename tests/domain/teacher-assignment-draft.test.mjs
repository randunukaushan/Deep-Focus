import assert from 'node:assert/strict';
import test from 'node:test';

import { createTeacherAssignmentDraft, reviseTeacherAssignmentDraft } from '../../src/features/education/teacher-assignment-draft.ts';

const input = { assignmentId: 'assignment-1', classId: 'class-1', title: 'Algebra practice', instructions: 'Complete the selected exercises.', deadline: '2026-10-20T00:00:00.000Z', education: { country: 'LK', stage: 'ol', subject: 'Mathematics' } };

test('teacher draft is bounded, versioned and keeps education context optional', () => {
  const result = createTeacherAssignmentDraft(input);
  assert.deepEqual(result, { valid: true, draft: { ...input, revision: 1 } });
});

test('teacher draft revision increments without changing identity', () => {
  const initial = createTeacherAssignmentDraft(input);
  assert.equal(initial.valid, true);
  if (!initial.valid) return;
  const revised = reviseTeacherAssignmentDraft(initial.draft, { title: 'Algebra practice — revision', instructions: input.instructions, deadline: undefined, education: input.education });
  assert.deepEqual(revised, { valid: true, draft: { assignmentId: 'assignment-1', classId: 'class-1', title: 'Algebra practice — revision', instructions: input.instructions, revision: 2, education: input.education } });
});

test('teacher draft rejects unsafe text, malformed dates and unsupported education', () => {
  assert.equal(createTeacherAssignmentDraft({ ...input, title: ' ' }).reason, 'invalid_text');
  assert.equal(createTeacherAssignmentDraft({ ...input, deadline: 'not-a-date' }).reason, 'invalid_deadline');
  assert.equal(createTeacherAssignmentDraft({ ...input, education: { country: 'US', stage: 'ol' } }).reason, 'invalid_metadata');
});

test('teacher draft carries no invite token, learner identity or private history', () => {
  const result = createTeacherAssignmentDraft({ ...input, inviteToken: 'secret', learnerId: 'learner-1', focusHistory: ['private'] });
  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal('inviteToken' in result.draft, false);
    assert.equal('learnerId' in result.draft, false);
    assert.equal('focusHistory' in result.draft, false);
  }
});
