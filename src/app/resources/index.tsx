import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { getResourceRuntimeCopy } from '@/features/localization/resource-runtime-copy';
import { loadResources, markResourceMissing, renameResource, saveResource } from '@/features/resources/resource-storage';
import type { LocalResource, LocalResourceKind } from '@/features/resources/resource-types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { Palette, Radius, Spacing } from '@/theme/tokens';

function newId(): string {
  const crypto = globalThis.crypto as Crypto & { randomUUID?: () => string } | undefined;
  return crypto?.randomUUID?.() ?? `resource-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function ResourcesRoute() {
  const router = useRouter();
  const { copy, locale } = useAppLocale();
  const runtimeCopy = getResourceRuntimeCopy(locale);
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = theme.primary;
  const [resources, setResources] = useState<LocalResource[]>([]);
  const [kind, setKind] = useState<LocalResourceKind>('reference');
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const refresh = useCallback(async () => {
    setState('loading'); setMessage(''); setMessageIsError(false);
    try { setResources(await loadResources()); setState('ready'); }
    catch { setState('error'); }
  }, []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  async function add() {
    setSaving(true); setMessage(''); setMessageIsError(false);
    const now = new Date().toISOString();
    try {
      await saveResource({ id: newId(), kind, title, reference, revision: 1, lifecycle: 'active', createdAt: now, updatedAt: now });
      setTitle(''); setReference(''); await refresh(); setMessage(copy.resourcesPage.saved); setMessageIsError(false);
    } catch { setMessageIsError(true); setMessage(copy.resourcesPage.saveError); }
    finally { setSaving(false); }
  }

  async function markMissing(resource: LocalResource) {
    setMessage(''); setMessageIsError(false);
    try { await markResourceMissing(resource.id, resource.updatedAt); await refresh(); }
    catch { setMessageIsError(true); setMessage(copy.resourcesPage.saveError); }
  }

  async function saveRename(resource: LocalResource) {
    if (saving || !renameTitle.trim()) return;
    setSaving(true); setMessage(''); setMessageIsError(false);
    try {
      const updatedAt = await renameResource(resource.id, resource.updatedAt, renameTitle);
      if (!updatedAt) { setMessage(runtimeCopy.renameConflict); setMessageIsError(true); return; }
      setRenamingId(null); setRenameTitle(''); await refresh(); setMessage(copy.resourcesPage.saved);
    } catch { setMessageIsError(true); setMessage(copy.resourcesPage.saveError); }
    finally { setSaving(false); }
  }

  return <SafeAreaView style={[styles.screen, { backgroundColor: background }]}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled"><View style={styles.content}>
    <Pressable accessibilityRole="button" accessibilityLabel={copy.resourcesPage.back} onPress={() => router.back()} style={styles.back}><Ionicons color={action} name="arrow-back" size={20} /><ThemedText style={{ color: action }} type="smallBold">{copy.resourcesPage.back}</ThemedText></Pressable>
    <SectionHeading eyebrow={copy.profile.resources} title={copy.resourcesPage.title} subtitle={copy.resourcesPage.subtitle} icon="book-outline" />
    <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}><ThemedText type="subtitle">{copy.resourcesPage.add}</ThemedText><ThemedText type="smallBold">{copy.resourcesPage.titleInput}</ThemedText><TextInput accessibilityLabel={copy.resourcesPage.titleInput} onChangeText={setTitle} placeholder={copy.resourcesPage.titleInput} placeholderTextColor={theme.textMuted} style={[styles.input, { color: theme.text, borderColor: border }]} value={title} /><ThemedText type="smallBold">{copy.resourcesPage.referenceInput}</ThemedText><TextInput accessibilityLabel={copy.resourcesPage.referenceInput} autoCapitalize="none" autoCorrect={false} onChangeText={setReference} placeholder={copy.resourcesPage.referenceInput} placeholderTextColor={theme.textMuted} style={[styles.input, { color: theme.text, borderColor: border }]} value={reference} /><View accessibilityRole="radiogroup" style={styles.choiceRow}><Pressable accessibilityLabel={copy.resourcesPage.typeReference} accessibilityRole="radio" accessibilityState={{ selected: kind === 'reference' }} onPress={() => setKind('reference')} style={[styles.choice, { borderColor: kind === 'reference' ? action : border }]}><ThemedText>{copy.resourcesPage.typeReference}</ThemedText></Pressable><Pressable accessibilityLabel={copy.resourcesPage.typeLink} accessibilityRole="radio" accessibilityState={{ selected: kind === 'external_link' }} onPress={() => setKind('external_link')} style={[styles.choice, { borderColor: kind === 'external_link' ? action : border }]}><ThemedText>{copy.resourcesPage.typeLink}</ThemedText></Pressable></View><Button accentColor={action} disabled={saving || !title.trim() || !reference.trim()} label={saving ? copy.resourcesPage.saving : copy.resourcesPage.save} onPress={() => void add()} /></ThemedView>
    {message ? <ThemedText accessibilityLiveRegion={messageIsError ? 'assertive' : 'polite'} accessibilityRole={messageIsError ? 'alert' : undefined} themeColor="textSecondary">{message}</ThemedText> : null}
    {state === 'loading' ? <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary">{copy.resourcesPage.loading}</ThemedText> : state === 'error' ? <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}><ThemedText accessibilityRole="alert" themeColor="textSecondary">{copy.resourcesPage.loadError}</ThemedText><Button accentColor={action} label={copy.resourcesPage.retry} onPress={() => void refresh()} variant="secondary" /></ThemedView> : resources.length === 0 ? <ThemedText themeColor="textSecondary">{copy.resourcesPage.empty}</ThemedText> : resources.map((resource) => <ThemedView key={resource.id} style={[styles.resource, { backgroundColor: surface, borderColor: border }]}><View style={styles.resourceCopy}>{renamingId === resource.id ? <TextInput accessibilityLabel={runtimeCopy.renameTitle} autoFocus editable={!saving} onChangeText={setRenameTitle} value={renameTitle} style={[styles.input, { color: theme.text, borderColor: border }]} /> : <ThemedText type="smallBold">{resource.title}</ThemedText>}<ThemedText themeColor="textSecondary" type="small">{resource.reference}</ThemedText><ThemedText themeColor="textSecondary" type="small">{resource.lifecycle === 'missing' ? copy.resourcesPage.missing : resource.kind === 'external_link' ? copy.resourcesPage.typeLink : copy.resourcesPage.typeReference}</ThemedText></View>{renamingId === resource.id ? <View style={styles.rowActions}><Button accentColor={action} disabled={saving || !renameTitle.trim()} label={runtimeCopy.saveRename} onPress={() => void saveRename(resource)} /><Button disabled={saving} label={runtimeCopy.cancelRename} onPress={() => { setRenamingId(null); setRenameTitle(''); }} variant="secondary" /></View> : <View style={styles.rowActions}><Button accentColor={action} disabled={saving} label={runtimeCopy.rename} onPress={() => { setRenamingId(resource.id); setRenameTitle(resource.title); }} variant="secondary" />{resource.lifecycle === 'active' ? <Button accentColor={action} disabled={saving} label={copy.resourcesPage.markMissing} onPress={() => void markMissing(resource)} variant="secondary" /> : null}</View>}</ThemedView>)}
  </View></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' }, back: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: Spacing.xs, minHeight: 44 }, header: { gap: Spacing.xs }, card: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, input: { borderBottomWidth: 1, fontSize: 16, minHeight: 48, paddingVertical: Spacing.sm }, choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }, choice: { borderRadius: Radius.card, borderWidth: 1, flex: 1, minHeight: 48, minWidth: 0, justifyContent: 'center', paddingHorizontal: Spacing.md }, resource: { alignItems: 'flex-start', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, padding: Spacing.md }, resourceCopy: { flex: 1, gap: 3, minWidth: 0 }, rowActions: { gap: Spacing.xs, minWidth: 132 } });
