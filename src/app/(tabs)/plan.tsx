import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Palette, Radius, Spacing } from '@/theme/tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export default function PlanRoute() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const action = isDark ? Palette.mintPrimary : Palette.homeLightAction;
  const border = isDark ? theme.border : Palette.homeLightBorder;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: isDark ? theme.background : Palette.homeLightBackground }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={{ color: action }} type="smallBold">PLAN</ThemedText>
            <ThemedText accessibilityRole="header" type="title">Make room for what matters.</ThemedText>
            <ThemedText themeColor="textSecondary">Choose a task or goal to work on next.</ThemedText>
          </View>
          <PlanLink action={action} border={border} icon="checkbox-outline" title="Tasks" detail="Keep your next steps clear." onPress={() => router.push('/tasks')} />
          <PlanLink action={action} border={border} icon="flag-outline" title="Goals" detail="Review the goals you chose." onPress={() => router.push('/goals')} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function PlanLink({ action, border, detail, icon, onPress, title }: { action: string; border: string; detail: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; title: string }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.link, { borderColor: border }, pressed && styles.pressed]}><Ionicons color={action} name={icon} size={24} /><View style={styles.copy}><ThemedText type="smallBold">{title}</ThemedText><ThemedText themeColor="textSecondary" type="small">{detail}</ThemedText></View><Ionicons color={action} name="chevron-forward" size={20} /></Pressable>;
}

const styles = StyleSheet.create({ screen: { flex: 1 }, scroll: { flexGrow: 1, padding: Spacing.lg }, content: { alignSelf: 'center', gap: Spacing.md, maxWidth: 560, width: '100%' }, header: { gap: Spacing.xs, marginBottom: Spacing.md }, link: { alignItems: 'center', borderRadius: Radius.card, borderWidth: 1, flexDirection: 'row', gap: Spacing.md, minHeight: 76, padding: Spacing.md }, copy: { flex: 1, gap: Spacing.xs }, pressed: { opacity: 0.78 } });
