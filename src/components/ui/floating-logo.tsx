import { useEffect } from "react";
import { Image, Platform, StyleSheet } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export default function FloatingLogo() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View
      entering={FadeInDown.duration(1000).springify()}
      style={[styles.gameTitleContainer, animatedStyle]}
    >
      <Image
        source={require("../../../assets/gameAssets/GameLogo.png")}
        alt="Logo"
        style={styles.gameTitleImage}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gameTitleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  gameTitleImage: {
    height: Platform.OS === "web" ? 300 : 250,
  },
});
