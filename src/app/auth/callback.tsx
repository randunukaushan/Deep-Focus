import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Palette, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAuthCallbackCopy } from '@/features/localization/auth-callback-copy';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function AuthCallbackRoute() {
  const router = useRouter();
  const { snapshot } = useAuth();
  const { locale } = useAppLocale();
  const copy = getAuthCallbackCopy(locale);
  const action = useColorScheme() === 'dark' ? Palette.mintPrimary : Palette.homeLightAction;
  const failed = snapshot.status === 'error';
  return <ThemedView style={styles.screen}>
    <View style={styles.content}>
      {failed ? null : <ActivityIndicator accessibilityLabel={copy.loadingTitle} />}
      <ThemedText accessibilityRole="header" type="subtitle">{failed ? copy.errorTitle : copy.loadingTitle}</ThemedText>
      <ThemedText accessibilityLiveRegion="polite" themeColor="textSecondary">{failed ? snapshot.message ?? copy.errorDetail : copy.loadingDetail}</ThemedText>
      {failed ? <Button accentColor={action} fullWidth label={copy.backToSignIn} onPress={() => router.replace('/auth/sign-in')} /> : null}
    </View>
  </ThemedView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, justifyContent: 'center', padding: Spacing.lg }, content: { alignSelf: 'center', alignItems: 'center', gap: Spacing.md, maxWidth: 480, width: '100%' } });
