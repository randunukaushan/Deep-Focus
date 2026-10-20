import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type DeepFocusSceneProps = {
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** The original preview artwork, bundled offline without ambient motion. */
export function DeepFocusScene({ dark = false, style }: DeepFocusSceneProps) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[styles.scene, style]}>
      <Image
        accessible={false}
        source={dark ? require('../assets/branding/preview-scene-dark.svg') : require('../assets/branding/preview-scene-light.svg')}
        contentFit="cover"
        contentPosition="bottom"
        transition={0}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
});
