import { DB } from "@/utils/db";
import { generateInviteCode } from "@/utils/invite-code";
import { id } from "@instantdb/react-native";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateLobbyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const colors = {
    bg: isDark ? "#000000" : "#ffffff",
    card: isDark ? "#1c1c1e" : "#f2f2f7",
    text: isDark ? "#ffffff" : "#000000",
    subtext: isDark ? "#8e8e93" : "#8e8e93",
    inputBorder: isDark ? "#38383a" : "#e5e5ea",
    inputBg: isDark ? "#2c2c2e" : "#ffffff",
    accent: isDark ? "#ffffff" : "#000000",
    accentText: isDark ? "#000000" : "#ffffff",
    buttonDisabled: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
    buttonDisabledText: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
    errorBg: isDark ? "rgba(255,69,58,0.12)" : "rgba(255,59,48,0.08)",
    errorText: isDark ? "#ff453a" : "#ff3b30",
  };

  const trimmedName = name.trim();
  const isValid = trimmedName.length >= 2;

  async function handleCreate() {
    if (!isValid || isLoading) return;
    Keyboard.dismiss();
    setError(null);
    setIsLoading(true);

    try {
      const code = generateInviteCode();
      const lobbyId = id();
      const memberId = id();

      // Create lobby + host member atomically
      await DB.transact([
        DB.tx.lobbies[lobbyId].update({
          code,
          hostName: trimmedName,
          status: "waiting",
          createdAt: Date.now(),
        }),
        DB.tx.lobbyMembers[memberId].update({
          name: trimmedName,
          joinedAt: Date.now(),
        }),
        DB.tx.lobbyMembers[memberId].link({ lobby: lobbyId }),
      ]);

      // Navigate to the lobby waiting room
      router.replace({
        pathname: "/(screens)/lobby",
        params: { lobbyId, memberId, isHost: "true" },
      });
    } catch (e) {
      setError("Failed to create lobby. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.backText, { color: colors.subtext }]}>
              ← Back
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Pressable style={styles.content} onPress={Keyboard.dismiss}>
          {/* Title block */}
          <Animated.View
            entering={FadeInDown.delay(60).duration(400).springify()}
            style={styles.titleBlock}
          >
            <Text style={[styles.title, { color: colors.text }]}>
              Create Lobby
            </Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>
              Enter your name to get started. We'll generate a unique invite
              code for your friends.
            </Text>
          </Animated.View>

          {/* Input card */}
          <Animated.View
            entering={FadeInDown.delay(120).duration(400).springify()}
            style={[
              styles.inputCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <Text style={[styles.inputLabel, { color: colors.subtext }]}>
              YOUR NAME
            </Text>
            <TextInput
              ref={inputRef}
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError(null);
              }}
              placeholder="e.g. Alex"
              placeholderTextColor={colors.subtext}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBg,
                },
              ]}
              maxLength={24}
              autoFocus
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <Text style={[styles.hint, { color: colors.subtext }]}>
              {trimmedName.length}/24 · Minimum 2 characters
            </Text>
          </Animated.View>

          {/* Error */}
          {error && (
            <Animated.View
              entering={FadeInUp.duration(200)}
              style={[styles.errorBox, { backgroundColor: colors.errorBg }]}
            >
              <Text style={[styles.errorText, { color: colors.errorText }]}>
                {error}
              </Text>
            </Animated.View>
          )}

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Create button */}
          <Animated.View
            entering={FadeInDown.delay(180).duration(400).springify()}
          >
            <TouchableOpacity
              onPress={handleCreate}
              activeOpacity={0.75}
              disabled={!isValid || isLoading}
              style={[
                styles.createBtn,
                isValid && !isLoading
                  ? { backgroundColor: colors.accent }
                  : { backgroundColor: colors.buttonDisabled },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator
                  color={isValid ? colors.accentText : colors.subtext}
                />
              ) : (
                <Text
                  style={[
                    styles.createBtnText,
                    isValid
                      ? { color: colors.accentText }
                      : { color: colors.buttonDisabledText },
                  ]}
                >
                  Create Lobby
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  kav: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "web" ? 48 : 24,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  titleBlock: {
    marginTop: 32,
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
  inputCard: {
    borderRadius: 16,
    padding: 20,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  input: {
    fontSize: 17,
    fontWeight: "500",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  hint: {
    fontSize: 12,
    fontWeight: "400",
  },
  errorBox: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
  },
  spacer: {
    flex: 1,
  },
  createBtn: {
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnText: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
});
