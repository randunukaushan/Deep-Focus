import assert from 'node:assert/strict';
import test from 'node:test';

const { acceptAssignment, prepareTeacherFeedback, selectProgressShare } = await import('../../src/features/education/classroom-local.ts');

const now = '2026-10-09T06:00:00.000Z';
const invite = { inviteId: 'invite-1', classId: 'class-1', state: 'issued', expiresAt: '2026-10-10T06:00:00.000Z', token: 'internal-only', version: 1 };
const assignment = { assignmentId: 'assignment-1', classId: 'class-1', title: 'Algebra practice', instructions: 'Complete the selected exercises.', deadline: '2026-10-20T00:00:00.000Z', revision: 1 };
const adult = { fixture: 'adult_test', legalReviewComplete: false, pilotEnabled: false };

test('learner assignment stays private until explicit confirmation', () => {
  assert.equal(acceptAssignment(invite, assignment, now, adult, 1, false).reason, 'not_confirmed');
  const result = acceptAssignment(invite, assignment, now, adult, 1, true);
  assert.deepEqual(result, { accepted: true, task: { taskId: 'classroom:assignment-1:1', assignmentId: 'assignment-1', title: 'Algebra practice', instructions: 'Complete the selected exercises.', deadline: '2026-10-20T00:00:00.000Z' } });
});

test('assignment acceptance fails closed for wrong class, stale invite and real-minor gate', () => {
  assert.equal(acceptAssignment({ ...invite, classId: 'other' }, assignment, now, adult, 1, true).reason, 'invalid_assignment');
  assert.equal(acceptAssignment({ ...invite, version: 2 }, assignment, now, adult, 1, true).reason, 'invite_denied');
  assert.equal(acceptAssignment(invite, assignment, now, { fixture: 'real_minor', legalReviewComplete: false, pilotEnabled: true }, 1, true).reason, 'invite_denied');
});

test('progress sharing contains only selected bounded status and assignment revision', () => {
  assert.deepEqual(selectProgressShare(assignment, 'completed'), { assignmentId: 'assignment-1', revision: 1, completion: 'completed' });
  assert.equal(selectProgressShare({ ...assignment, title: '' }, 'completed'), null);
  assert.equal(selectProgressShare(assignment, 'private_history'), null);
});

test('teacher feedback is restricted to the matching assignment revision', () => {
  assert.deepEqual(prepareTeacherFeedback(assignment, 'teacher', 1, 'Try the next worked example.'), { assignmentId: 'assignment-1', revision: 1, message: 'Try the next worked example.' });
  assert.equal(prepareTeacherFeedback(assignment, 'learner', 1, 'A note'), null);
  assert.equal(prepareTeacherFeedback(assignment, 'teacher', 2, 'A stale note'), null);
});
