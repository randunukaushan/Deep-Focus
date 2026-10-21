import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { createStableId } from '@/features/identity/stable-ids';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { getTeacherAssignmentCopy } from '@/features/localization/teacher-assignment-copy';
import { createTeacherAssignmentDraft, type TeacherAssignmentDraft } from '@/features/education/teacher-assignment-draft';
import { loadTeacherAssignmentDrafts, saveTeacherAssignmentDraft } from '@/features/storage/local-database';
import { Radius, Spacing } from '@/theme/tokens';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { useTheme } from '@/hooks/use-theme';

export default function TeacherAssignmentRoute() {
  const router = useRouter();
  const theme = useTheme();
  const { locale } = useAppLocale();
  const text = getTeacherAssignmentCopy(locale);
  const [draft, setDraft] = useState<TeacherAssignmentDraft | null>(null);
  const [classId, setClassId] = useState('class-1');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void loadTeacherAssignmentDrafts().then((drafts) => {
      if (!active || drafts.length === 0) return;
      const saved = drafts[0];
      setDraft(saved); setClassId(saved.classId); setTitle(saved.title); setInstructions(saved.instructions);
    }).catch(() => { if (active) setError(text.loadError); });
    return () => { active = false; };
  }, [text.loadError]);

  async function save() {
    setSaving(true); setMessage(''); setError('');
    const result = createTeacherAssignmentDraft({
      assignmentId: draft?.assignmentId ?? createStableId(), classId, title, instructions,
      revision: (draft?.revision ?? 0) + 1, education: { country: 'LK', stage: 'ol' },
    });
    if (!result.valid) { setError(text.saveError); setSaving(false); return; }
    try {
      const accepted = await saveTeacherAssignmentDraft(result.draft);
      if (accepted) { setDraft(result.draft); setMessage(text.saved); } else setError(text.saveError);
    } catch { setError(text.saveError); }
    setSaving(false);
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityRole="button" accessibilityLabel={text.back} onPress={() => router.back()} style={styles.back}><Ionicons color={theme.primary} name="arrow-back" size={20} /><ThemedText style={{ color: theme.primary }} type="smallBold">{text.back}</ThemedText></Pressable>
        <SectionHeading eyebrow={text.eyebrow} title={text.title} subtitle={text.detail} icon="school-outline" />
        <Field label={text.classId} value={classId} onChangeText={setClassId} theme={theme} />
        <Field label={text.titleLabel} value={title} onChangeText={setTitle} theme={theme} />
        <Field label={text.instructions} value={instructions} onChangeText={setInstructions} multiline theme={theme} />
        {error ? <ThemedText accessibilityLiveRegion="assertive" accessibilityRole="alert" themeColor="textPrimary">{error}</ThemedText> : null}
        {message ? <ThemedText accessibilityLiveRegion="polite" style={{ color: theme.primary }}>{message}</ThemedText> : null}
        <Button label={text.save} loading={saving} loadingAccessibilityLabel={text.saving} onPress={() => void save()} />
      </ScrollView>
    </KeyboardAvoidingView></SafeAreaView>
  );
}

function Field({ label, value, onChangeText, multiline = false, theme }: { label: string; value: string; onChangeText: (value: string) => void; multiline?: boolean; theme: { text: string; border: string; surface: string } }) {
  return <View style={styles.field}><ThemedText type="smallBold">{label}</ThemedText><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} multiline={multiline} maxLength={240} style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }, multiline && styles.multiline]} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { alignSelf: 'center', maxWidth: 560, padding: Spacing.lg, gap: Spacing.md, width: '100%' },
  back: { alignItems: 'center', flexDirection: 'row', gap: Spacing.sm, minHeight: 48 },
  field: { gap: Spacing.xs },
  input: { borderWidth: 1, borderRadius: Radius.card, minHeight: 48, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: 16 },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
});
