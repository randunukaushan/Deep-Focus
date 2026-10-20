import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('resource and assignment presentation reuses preview-aligned components without replacing storage operations', () => {
  const resources = readFileSync('src/app/resources/index.tsx', 'utf8');
  assert.match(resources, /<SectionHeading/);
  assert.match(resources, /const action = theme.primary/);
  assert.match(resources, /keyboardShouldPersistTaps="handled"/);
  for (const field of ['titleInput', 'referenceInput']) assert.ok(resources.includes(`<ThemedText type="smallBold">{copy.resourcesPage.${field}}</ThemedText>`));
  assert.match(resources, /renameResource\(resource.id, resource.updatedAt, renameTitle\)/);
  const assignment = readFileSync('src/app/education/teacher-assignment.tsx', 'utf8');
  assert.match(assignment, /<SectionHeading/); assert.match(assignment, /<Button label=\{text.save\}/);
  assert.match(assignment, /saveTeacherAssignmentDraft\(result.draft\)/);
  assert.doesNotMatch(assignment, /Palette.mintPrimary|Palette.deepNavy/);
});
test('goal detail has a scrollable keyboard-aware container and retains destructive-action confirmation', () => {
  const goal = readFileSync('src/app/goals/[goalId].tsx', 'utf8');
  assert.match(goal, /<KeyboardAvoidingView/);
  assert.match(goal, /<ScrollView contentContainerStyle=\{styles.content\} keyboardShouldPersistTaps="handled"/);
  assert.match(goal, /content: \{ alignSelf: 'center', flexGrow: 1/);
  assert.match(goal, /text.deleteConfirmTitle/);
  assert.match(goal, /text.deleteAndKeepTasks/);
  assert.match(goal, /const action = theme.primary/);
});
