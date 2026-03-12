import { DB } from "@/utils/db";
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

type Step = "code" | "name";

export default function JoinLobbyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref for focusing second input
  const nameInputRef = useRef<TextInput>(null);

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
    codeBg: isDark ? "#2c2c2e" : "#f2f2f7",
    codeText: isDark ? "#ffffff" : "#000000",
  };

  const normalizedCode = code.trim().toUpperCase();
  const trimmedName = name.trim();

  const isCodeValid = normalizedCode.length === 6;
  const isNameValid = trimmedName.length >= 2;

  // Step 1: Verify that the lobby code exists
  async function handleVerifyCode() {
    if (!isCodeValid || isLoading) return;
    Keyboard.dismiss();
    setError(null);
    setIsLoading(true);

    try {
      const result = await DB.queryOnce({
        lobbies: {
          $: { where: { code: normalizedCode } },
        },
      });

      const matchingLobbies = result.data.lobbies ?? [];
      if (matchingLobbies.length === 0) {
        setError("No lobby found with that code. Check your invite code.");
        setIsLoading(false);
        return;
      }

      const lobby = matchingLobbies[0];
      if (lobby.status !== "waiting") {
        setError("This lobby is no longer accepting players.");
        setIsLoading(false);
        return;
      }

      // Code is valid — move to step 2 (enter name)
      setIsLoading(false);
      setStep("name");
      setTimeout(() => nameInputRef.current?.focus(), 100);
    } catch (e) {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  // Step 2: Join the lobby with the given name
  async function handleJoin() {
    if (!isNameValid || isLoading) return;
    Keyboard.dismiss();
    setError(null);
    setIsLoading(true);

    try {
      // Re-fetch the lobby to get the id
      const result = await DB.queryOnce({
        lobbies: {
          $: { where: { code: normalizedCode } },
        },
      });

      const lobby = (result.data.lobbies ?? [])[0];
      if (!lobby) {
        setError("Lobby no longer exists.");
        setIsLoading(false);
        return;
      }

      const memberId = id();
      await DB.transact([
        DB.tx.lobbyMembers[memberId].update({
          name: trimmedName,
          joinedAt: Date.now(),
        }),
        DB.tx.lobbyMembers[memberId].link({ lobby: lobby.id }),
      ]);

      router.replace({
        pathname: "/(screens)/lobby",
        params: { lobbyId: lobby.id, memberId, isHost: "false" },
      });
    } catch (e) {
      setError("Failed to join lobby. Please try again.");
      setIsLoading(false);
    }
  }

  function handleBack() {
    if (step === "name") {
      // Go back to code entry
      setStep("code");
      setError(null);
    } else {
      router.back();
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
            onPress={handleBack}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.backText, { color: colors.subtext }]}>
              ← Back
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Pressable style={styles.content} onPress={Keyboard.dismiss}>
          {/* Title */}
          <Animated.View
            key={step + "-title"}
            entering={FadeInDown.delay(60).duration(400).springify()}
            style={styles.titleBlock}
          >
            <Text style={[styles.title, { color: colors.text }]}>
              {step === "code" ? "Join Lobby" : "Enter Your Name"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>
              {step === "code"
                ? "Ask the lobby host for their 6-character invite code."
                : "Choose a display name that other players will see."}
            </Text>
          </Animated.View>

          {/* Step 1: Code input */}
          {step === "code" && (
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
                INVITE CODE
              </Text>
              <TextInput
                value={code}
                onChangeText={(t) => {
                  // Allow only alphanumeric chars, auto-uppercase
                  setCode(t.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
                  setError(null);
                }}
                placeholder="e.g. ABC123"
                placeholderTextColor={colors.subtext}
                style={[
                  styles.codeInput,
                  {
                    color: colors.codeText,
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.codeBg,
                  },
                ]}
                maxLength={6}
                autoFocus
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleVerifyCode}
                keyboardType={Platform.OS === "ios" ? "default" : "visible-password"}
              />
              <Text style={[styles.hint, { color: colors.subtext }]}>
                {normalizedCode.length}/6 characters
              </Text>
            </Animated.View>
          )}

          {/* Step 2: Name input */}
          {step === "name" && (
            <Animated.View
              entering={FadeInDown.delay(40).duration(350).springify()}
              style={[
                styles.inputCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              {/* Show the confirmed code as a pill */}
              <View style={styles.codePill}>
                <View
                  style={[
                    styles.codePillInner,
                    { backgroundColor: colors.codeBg },
                  ]}
                >
                  <Text
                    style={[styles.codePillText, { color: colors.subtext }]}
                  >
                    Code:{"  "}
                    <Text style={{ color: colors.text, fontWeight: "700" }}>
                      {normalizedCode}
                    </Text>
                  </Text>
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: colors.subtext }]}>
                YOUR NAME
              </Text>
              <TextInput
                ref={nameInputRef}
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
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleJoin}
              />
              <Text style={[styles.hint, { color: colors.subtext }]}>
                {trimmedName.length}/24 · Minimum 2 characters
              </Text>
            </Animated.View>
          )}

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

          <View style={styles.spacer} />

          {/* Action button */}
          <Animated.View
            key={step + "-btn"}
            entering={FadeInDown.delay(180).duration(400).springify()}
          >
            {step === "code" ? (
              <TouchableOpacity
                onPress={handleVerifyCode}
                activeOpacity={0.75}
                disabled={!isCodeValid || isLoading}
                style={[
                  styles.actionBtn,
                  isCodeValid && !isLoading
                    ? { backgroundColor: colors.accent }
                    : { backgroundColor: colors.buttonDisabled },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator
                    color={isCodeValid ? colors.accentText : colors.subtext}
                  />
                ) : (
                  <Text
                    style={[
                      styles.actionBtnText,
                      isCodeValid
                        ? { color: colors.accentText }
                        : { color: colors.buttonDisabledText },
                    ]}
                  >
                    Verify Code
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleJoin}
                activeOpacity={0.75}
                disabled={!isNameValid || isLoading}
                style={[
                  styles.actionBtn,
                  isNameValid && !isLoading
                    ? { backgroundColor: colors.accent }
                    : { backgroundColor: colors.buttonDisabled },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator
                    color={isNameValid ? colors.accentText : colors.subtext}
                  />
                ) : (
                  <Text
                    style={[
                      styles.actionBtnText,
                      isNameValid
                        ? { color: colors.accentText }
                        : { color: colors.buttonDisabledText },
                    ]}
                  >
                    Join Lobby
                  </Text>
                )}
              </TouchableOpacity>
            )}
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
  codeInput: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 6,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    textAlign: "center",
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
  codePill: {
    marginBottom: 4,
  },
  codePillInner: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  codePillText: {
    fontSize: 13,
    fontWeight: "500",
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
  actionBtn: {
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
});
