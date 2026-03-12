import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const WS_URL = "ws://localhost:8787/ws";

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  isDarkMode: boolean;
  delay?: number;
  rotationDirection?: number;
}

const AnimatedButton = ({
  title,
  onPress,
  isDarkMode,
  delay = 0,
  rotationDirection = 1,
}: AnimatedButtonProps) => {
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
};

const FloatingLogo = () => {
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
      />
    </Animated.View>
  );
};

export default function Index() {
  const [status, setStatus] = useState("Disconnected");

  /*  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      setStatus("Connected");
      console.log("WebSocket connected");
    };

    socket.onclose = () => {
      setStatus("Disconnected");
      console.log("WebSocket closed");
    };

    socket.onerror = (e) => {
      setStatus("Error connecting");
      console.error("WebSocket error:", e);
    };

    return () => {
      socket.close();
    };
  }, []);
 */
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#ffffff" }]}>
      <View style={styles.contentContainer}>
        <View style={styles.topSection}>
          <FloatingLogo />
        </View>

        <View style={styles.gameMenuButtonsContainer}>
          <AnimatedButton
            title="Create Lobby"
            onPress={() => {}}
            isDarkMode={false}
            delay={100}
            rotationDirection={-1}
          />
          <AnimatedButton
            title="Join Lobby"
            onPress={() => {}}
            isDarkMode={false}
            delay={200}
            rotationDirection={1}
          />
          <AnimatedButton
            title="Settings"
            onPress={() => {}}
            isDarkMode={false}
            delay={300}
            rotationDirection={-1}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  topSection: {
    alignItems: "center",
    marginTop: Platform.OS === "android" ? 70 : 50,
    flex: 1,
  },
  gameTitleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  gameTitleImage: {
    height: Platform.OS === "web" ? 300 : 250,
    resizeMode: "contain",
  },

  /* Game Menu Buttons - Flat & Minimal */
  gameMenuButtonsContainer: {
    paddingHorizontal: 32,
    paddingBottom:
      Platform.OS === "web" ? 60 : Platform.OS === "android" ? 40 : 30,
    gap: 14,
    justifyContent: "flex-end",
    flex: 1,
  },
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
