import { Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type AnimatedButtonProps = {
  title: string;
  onPress: () => void;
  isDarkMode: boolean;
  delay?: number;
  rotationDirection?: number;
};

export default function AnimatedButton({
  title,
  onPress,
  isDarkMode,
  delay = 0,
  rotationDirection = 1,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  // Ultra-minimalist backgrounds (subtle translucency instead of solid colors)
  const bgColor = isDarkMode
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(0, 0, 0, 0.04)";
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(16).stiffness(120)}
      style={[styles.buttonWrapper, animatedStyle]}
    >
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.9, { damping: 10, stiffness: 300 });
          // Playful slight tilt on press
          rotation.value = withSpring(1.5 * rotationDirection, {
            damping: 10,
            stiffness: 300,
          });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 250 });
          rotation.value = withSpring(0, { damping: 12, stiffness: 250 });
        }}
        onPress={onPress}
        style={[styles.button, { backgroundColor: bgColor }]}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    width: "100%",
  },
  button: {
    paddingVertical: 20,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
});
