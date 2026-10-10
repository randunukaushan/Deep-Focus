import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createStableId } from '@/features/identity/stable-ids';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { createTeacherAssignmentDraft, type TeacherAssignmentDraft } from '@/features/education/teacher-assignment-draft';
import { loadTeacherAssignmentDrafts, saveTeacherAssignmentDraft } from '@/features/storage/local-database';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import { useTheme } from '@/hooks/use-theme';

export default function TeacherAssignmentRoute() {
  const router = useRouter();
  const theme = useTheme();
  const { locale } = useAppLocale();
  const text = locale === 'si'
    ? { back: 'ආපසු', eyebrow: 'අධ්‍යාපන පදනම', title: 'Assignment draft එකක් සකස් කරන්න', detail: 'මෙය මෙම උපාංගයේ පමණක් සුරකෙයි. තවමත් කිසිදු invite එකක් හෝ cloud sharing එකක් සිදු නොවේ.', classId: 'පන්තියේ හඳුනාගැනීම', titleLabel: 'මාතෘකාව', instructions: 'උපදෙස්', save: 'දේශීය draft එක සුරකින්න', saving: 'සුරකිමින්…', saved: 'දේශීය draft එක සුරකින ලදී.', loadError: 'Draft කියවිය නොහැක.', saveError: 'Draft සුරැකිය නොහැක.' }
    : locale === 'ta'
      ? { back: 'திரும்பு', eyebrow: 'கல்வி அடித்தளம்', title: 'Assignment draft உருவாக்கவும்', detail: 'இது இந்தச் சாதனத்தில் மட்டும் சேமிக்கப்படும். Invite அல்லது cloud sharing இன்னும் இல்லை.', classId: 'வகுப்பு அடையாளம்', titleLabel: 'தலைப்பு', instructions: 'வழிமுறைகள்', save: 'உள்ளூர் draft-ஐ சேமிக்கவும்', saving: 'சேமிக்கப்படுகிறது…', saved: 'உள்ளூர் draft சேமிக்கப்பட்டது.', loadError: 'Draft-ஐ படிக்க முடியவில்லை.', saveError: 'Draft-ஐ சேமிக்க முடியவில்லை.' }
      : { back: 'Back', eyebrow: 'EDUCATION FOUNDATION', title: 'Create an assignment draft', detail: 'This stays on this device. No invite or cloud sharing is performed yet.', classId: 'Class identifier', titleLabel: 'Title', instructions: 'Instructions', save: 'Save local draft', saving: 'Saving…', saved: 'Local draft saved.', loadError: 'Draft could not be read.', saveError: 'Draft could not be saved.' };
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
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityRole="button" accessibilityLabel={text.back} onPress={() => router.back()}><ThemedText style={{ color: Palette.mintPrimary }} type="smallBold">‹ {text.back}</ThemedText></Pressable>
        <ThemedText style={styles.eyebrow} type="smallBold">{text.eyebrow}</ThemedText>
        <ThemedText accessibilityRole="header" type="title">{text.title}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.detail}>{text.detail}</ThemedText>
        <Field label={text.classId} value={classId} onChangeText={setClassId} theme={theme} />
        <Field label={text.titleLabel} value={title} onChangeText={setTitle} theme={theme} />
        <Field label={text.instructions} value={instructions} onChangeText={setInstructions} multiline theme={theme} />
        {error ? <ThemedText accessibilityLiveRegion="polite" style={styles.error}>{error}</ThemedText> : null}
        {message ? <ThemedText accessibilityLiveRegion="polite" style={styles.success}>{message}</ThemedText> : null}
        <Pressable accessibilityRole="button" accessibilityLabel={text.save} disabled={saving} onPress={() => void save()} style={({ pressed }) => [styles.button, pressed && styles.pressed, saving && styles.disabled]}>
          <ThemedText style={styles.buttonText} type="smallBold">{saving ? text.saving : text.save}</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

function Field({ label, value, onChangeText, multiline = false, theme }: { label: string; value: string; onChangeText: (value: string) => void; multiline?: boolean; theme: { text: string; border: string; surface: string } }) {
  return <View style={styles.field}><ThemedText type="smallBold">{label}</ThemedText><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} multiline={multiline} maxLength={240} style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }, multiline && styles.multiline]} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, scroll: { padding: Spacing.lg, gap: Spacing.md }, eyebrow: { color: Palette.mintPrimary, marginTop: Spacing.lg }, detail: { lineHeight: 22 }, field: { gap: Spacing.xs }, input: { borderWidth: 1, borderRadius: Radius.card, minHeight: 48, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: 16 }, multiline: { minHeight: 120, textAlignVertical: 'top' }, button: { backgroundColor: Palette.mintPrimary, borderRadius: Radius.card, padding: Spacing.md, alignItems: 'center' }, buttonText: { color: Palette.deepNavy }, pressed: { opacity: 0.8 }, disabled: { opacity: 0.5 }, error: { color: Palette.error }, success: { color: Palette.mintPrimary },
});
