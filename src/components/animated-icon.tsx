import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { usePresentation } from '@/features/settings/presentation-context';

const BRAND_IMAGE = require('../../assets/images/deep-focus-brand-reference.png');
const READING_TIME_MS = 1500;
const FADE_TIME_MS = 350;

/** The owner's original lockup, kept at a readable size throughout launch. */
export function AnimatedSplashOverlay() {
  const presentation = usePresentation();
  const [visible, setVisible] = useState(true);
  const [imageReady, setImageReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [opacity] = useState(() => new Animated.Value(1));
  const skipMotion = presentation?.preferences.reduceMotion || reducedMotion === true;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReducedMotion(enabled);
    }).catch(() => {
      if (mounted) setReducedMotion(true);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    // Asset/accessibility failures must not leave an indefinite launch overlay.
    const timeout = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (skipMotion) {
      const dismiss = setTimeout(() => setVisible(false), 0);
      return () => clearTimeout(dismiss);
    }
    if (!imageReady || reducedMotion === null || presentation?.loading || !visible) return;
    let mounted = true;
    const fade = Animated.timing(opacity, {
      toValue: 0, duration: FADE_TIME_MS,
      easing: Easing.inOut(Easing.quad), useNativeDriver: true,
    });
    const timeout = setTimeout(() => {
      fade.start(({ finished }) => { if (mounted && finished) setVisible(false); });
    }, READING_TIME_MS);
    return () => { mounted = false; clearTimeout(timeout); fade.stop(); };
  }, [imageReady, opacity, presentation?.loading, reducedMotion, skipMotion, visible]);

  if (!visible || skipMotion) return null;
  return (
    <Animated.View style={[styles.splash, { opacity }]}
      accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Image source={BRAND_IMAGE} contentFit="contain" transition={0}
        onLoad={() => setImageReady(true)} onError={() => setVisible(false)}
        accessible={false} style={styles.lockup} />
    </Animated.View>
  );
}

export function AnimatedIcon() {
  return <View style={styles.icon}><Image source={BRAND_IMAGE} contentFit="contain" style={StyleSheet.absoluteFill} /></View>;
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#031226', zIndex: 1000, elevation: 1000,
  },
  lockup: { width: '100%', maxWidth: 420, aspectRatio: 1 },
  icon: { width: 128, height: 128 },
});
