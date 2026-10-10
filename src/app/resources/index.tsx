import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { loadResources, markResourceMissing, saveResource } from '@/features/resources/resource-storage';
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
  const { copy } = useAppLocale();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const background = isDark ? theme.background : Palette.homeLightBackground;
  const surface = isDark ? theme.surface : Palette.homeLightSurface;
  const border = isDark ? theme.border : Palette.homeLightBorder;
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const [resources, setResources] = useState<LocalResource[]>([]);
  const [kind, setKind] = useState<LocalResourceKind>('reference');
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    setState('loading'); setMessage('');
    try { setResources(await loadResources()); setState('ready'); }
    catch { setState('error'); }
  }, []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  async function add() {
    setSaving(true); setMessage('');
    const now = new Date().toISOString();
    try {
      await saveResource({ id: newId(), kind, title, reference, revision: 1, lifecycle: 'active', createdAt: now, updatedAt: now });
      setTitle(''); setReference(''); setMessage(copy.resourcesPage.saved); await refresh();
    } catch { setMessage(copy.resourcesPage.saveError); }
    finally { setSaving(false); }
  }

  async function markMissing(resource: LocalResource) {
    setMessage('');
    try { await markResourceMissing(resource.id, resource.updatedAt); await refresh(); }
    catch { setMessage(copy.resourcesPage.saveError); }
  }

  return <ThemedView style={[styles.screen, { backgroundColor: background }]}><ScrollView contentContainerStyle={styles.scroll}><View style={styles.content}>
    <Pressable accessibilityRole="button" accessibilityLabel={copy.profile.title} onPress={() => router.back()} style={styles.back}><Ionicons color={action} name="arrow-back" size={20} /><ThemedText style={{ color: action }} type="smallBold">{copy.profile.title}</ThemedText></Pressable>
    <View style={styles.header}><ThemedText style={{ color: action }} type="smallBold">{copy.profile.resources}</ThemedText><ThemedText accessibilityRole="header" type="title">{copy.resourcesPage.title}</ThemedText><ThemedText themeColor="textSecondary">{copy.resourcesPage.subtitle}</ThemedText></View>
    <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}><ThemedText type="subtitle">{copy.resourcesPage.add}</ThemedText><TextInput accessibilityLabel={copy.resourcesPage.titleInput} onChangeText={setTitle} placeholder={copy.resourcesPage.titleInput} placeholderTextColor={theme.textMuted} style={[styles.input, { color: theme.text, borderColor: border }]} value={title} /><TextInput accessibilityLabel={copy.resourcesPage.referenceInput} autoCapitalize="none" autoCorrect={false} onChangeText={setReference} placeholder={copy.resourcesPage.referenceInput} placeholderTextColor={theme.textMuted} style={[styles.input, { color: theme.text, borderColor: border }]} value={reference} /><View style={styles.choiceRow}><Pressable accessibilityRole="radio" accessibilityState={{ selected: kind === 'reference' }} onPress={() => setKind('reference')} style={[styles.choice, { borderColor: kind === 'reference' ? action : border }]}><ThemedText>{copy.resourcesPage.typeReference}</ThemedText></Pressable><Pressable accessibilityRole="radio" accessibilityState={{ selected: kind === 'external_link' }} onPress={() => setKind('external_link')} style={[styles.choice, { borderColor: kind === 'external_link' ? action : border }]}><ThemedText>{copy.resourcesPage.typeLink}</ThemedText></Pressable></View><Button accentColor={action} disabled={saving || !title.trim() || !reference.trim()} label={saving ? copy.resourcesPage.saving : copy.resourcesPage.save} onPress={() => void add()} /></ThemedView>
    {message ? <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary">{message}</ThemedText> : null}
    {state === 'loading' ? <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary">{copy.resourcesPage.loading}</ThemedText> : state === 'error' ? <ThemedView style={[styles.card, { backgroundColor: surface, borderColor: border }]}><ThemedText accessibilityRole="alert" themeColor="textSecondary">{copy.resourcesPage.loadError}</ThemedText><Button accentColor={action} label={copy.resourcesPage.retry} onPress={() => void refresh()} variant="secondary" /></ThemedView> : resources.length === 0 ? <ThemedText themeColor="textSecondary">{copy.resourcesPage.empty}</ThemedText> : resources.map((resource) => <ThemedView key={resource.id} style={[styles.resource, { backgroundColor: surface, borderColor: border }]}><View style={styles.resourceCopy}><ThemedText type="smallBold">{resource.title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{resource.reference}</ThemedText><ThemedText themeColor="textSecondary" type="small">{resource.lifecycle === 'missing' ? copy.resourcesPage.missing : resource.kind === 'external_link' ? copy.resourcesPage.typeLink : copy.resourcesPage.typeReference}</ThemedText></View>{resource.lifecycle === 'active' ? <Button accentColor={action} label={copy.resourcesPage.markMissing} onPress={() => void markMissing(resource)} variant="secondary" /> : null}</ThemedView>)}
  </View></ScrollView></ThemedView>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.lg, maxWidth: 560, width: '100%' }, back: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: Spacing.xs, minHeight: 44 }, header: { gap: Spacing.xs }, card: { borderRadius: Radius.card, borderWidth: 1, gap: Spacing.md, padding: Spacing.lg }, input: { borderBottomWidth: 1, fontSize: 16, minHeight: 48, paddingVertical: Spacing.sm }, choiceRow: { flexDirection: 'row', gap: Spacing.sm }, choice: { borderRadius: Radius.card, borderWidth: 1, flex: 1, minHeight: 48, justifyContent: 'center', paddingHorizontal: Spacing.md }, resource: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, padding: Spacing.md }, resourceCopy: { flex: 1, gap: 3 } });
