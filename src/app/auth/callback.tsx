import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { Button } from '@/components/ui/button';
import { AuthFrame } from '@/components/ui/auth-frame';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { getAuthCallbackCopy } from '@/features/localization/auth-callback-copy';
import { useAppLocale } from '@/features/localization/app-locale-context';

export default function AuthCallbackRoute() {
  const router = useRouter();
  const { snapshot } = useAuth();
  const { locale } = useAppLocale();
  const copy = getAuthCallbackCopy(locale);
  const action = useTheme().primary;
  const failed = snapshot.status === 'error';
  return <AuthFrame title={failed ? copy.errorTitle : copy.loadingTitle}
    subtitle={failed ? snapshot.message ?? copy.errorDetail : copy.loadingDetail}
    subtitleAccessibility={{ accessibilityLiveRegion: failed ? 'assertive' : 'polite', accessibilityRole: failed ? 'alert' : undefined }}>
      {failed ? null : <ActivityIndicator color={action} accessibilityLabel={copy.loadingTitle} />}
      {failed ? <Button accentColor={action} fullWidth label={copy.backToSignIn} onPress={() => router.replace('/auth/sign-in')} /> : null}
  </AuthFrame>;
}
