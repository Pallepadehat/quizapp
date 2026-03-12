import AnimatedButton from "@/components/ui/animated-button";
import FloatingLogo from "@/components/ui/floating-logo";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#ffffff" }]}>
      <View style={styles.contentContainer}>
        <Animated.View style={styles.topSection}>
          <FloatingLogo />
        </Animated.View>

        <View style={styles.gameMenuButtonsContainer}>
          <AnimatedButton
            title="Create Lobby"
            onPress={() => router.push("/(screens)/create-lobby")}
            isDarkMode={false}
            delay={100}
            rotationDirection={-1}
          />
          <AnimatedButton
            title="Join Lobby"
            onPress={() => router.push("/(screens)/join-lobby")}
            isDarkMode={false}
            delay={200}
            rotationDirection={1}
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
  gameMenuButtonsContainer: {
    paddingHorizontal: 32,
    paddingBottom:
      Platform.OS === "web" ? 60 : Platform.OS === "android" ? 40 : 30,
    gap: 14,
    justifyContent: "flex-end",
    flex: 1,
  },
});
