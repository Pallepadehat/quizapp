import { DB } from "@/utils/db";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
type Member = {
  id: string;
  name: string;
  joinedAt: number | string;
};

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────
export default function LobbyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    lobbyId: string;
    memberId: string;
    isHost: string;
  }>();

  const lobbyId = params.lobbyId ?? "";
  const memberId = params.memberId ?? "";
  const isHost = params.isHost === "true";

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [codeCopied, setCodeCopied] = useState(false);

  const colors = {
    bg: isDark ? "#000000" : "#ffffff",
    card: isDark ? "#1c1c1e" : "#f2f2f7",
    text: isDark ? "#ffffff" : "#000000",
    subtext: isDark ? "#8e8e93" : "#8e8e93",
    divider: isDark ? "#38383a" : "#e5e5ea",
    accent: isDark ? "#ffffff" : "#000000",
    accentText: isDark ? "#000000" : "#ffffff",
    memberBg: isDark ? "#2c2c2e" : "#ffffff",
    memberBorder: isDark ? "#38383a" : "#e5e5ea",
    codeBg: isDark ? "#2c2c2e" : "#f2f2f7",
    dangerBg: isDark ? "rgba(255,69,58,0.12)" : "rgba(255,59,48,0.08)",
    dangerText: isDark ? "#ff453a" : "#ff3b30",
  };

  // ── Real-time lobby subscription ──────────────────────────
  const { isLoading, error, data } = DB.useQuery(
    lobbyId
      ? {
          lobbies: {
            $: { where: { id: lobbyId } },
            members: {},
          },
        }
      : null,
  );

  const lobby = data?.lobbies?.[0] ?? null;
  const members: Member[] = (lobby?.members ?? []).sort((a: Member, b: Member) =>
    Number(a.joinedAt) < Number(b.joinedAt) ? -1 : 1,
  );

  // ── Leave lobby ───────────────────────────────────────────
  async function handleLeave() {
    Alert.alert(
      isHost ? "Close Lobby" : "Leave Lobby",
      isHost
        ? "Closing the lobby will remove all members. Are you sure?"
        : "Are you sure you want to leave this lobby?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isHost ? "Close" : "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              if (isHost) {
                // Delete all members then the lobby
                const txns = members.map((m) =>
                  DB.tx.lobbyMembers[m.id].delete(),
                );
                txns.push(DB.tx.lobbies[lobbyId].delete());
                await DB.transact(txns);
              } else {
                await DB.transact(DB.tx.lobbyMembers[memberId].delete());
              }
              router.replace("/(screens)/");
            } catch {
              Alert.alert("Error", "Could not leave lobby. Please try again.");
            }
          },
        },
      ],
    );
  }

  // ── Share / copy invite code ──────────────────────────────
  async function handleShareCode() {
    if (!lobby?.code) return;
    const code = lobby.code as string;
    if (Platform.OS === "web") {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } else {
      Share.share({ message: `Join my quiz lobby! Code: ${code}` });
    }
  }

  // ── Error / loading / not found states ───────────────────
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.root, { backgroundColor: colors.bg }]}
      >
        <View style={styles.centeredState}>
          <ActivityIndicator color={colors.text} />
          <Text style={[styles.stateText, { color: colors.subtext }]}>
            Loading lobby…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !lobby) {
    return (
      <SafeAreaView
        style={[styles.root, { backgroundColor: colors.bg }]}
      >
        <View style={styles.centeredState}>
          <Text style={[styles.stateTitle, { color: colors.text }]}>
            Lobby Not Found
          </Text>
          <Text style={[styles.stateText, { color: colors.subtext }]}>
            This lobby may have been closed.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(screens)/")}
            style={[styles.goHomeBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.goHomeBtnText, { color: colors.accentText }]}>
              Go Home
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const code = lobby.code as string;
  const hostName = lobby.hostName as string;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400).springify()}
        style={[styles.headerRow, { borderBottomColor: colors.divider }]}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Lobby
          </Text>
          <View
            style={[styles.statusPill, { backgroundColor: colors.card }]}
          >
            <View style={styles.statusDot} />
            <Text style={[styles.statusText, { color: colors.subtext }]}>
              Waiting
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleLeave}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.leaveText, { color: colors.dangerText }]}>
            {isHost ? "Close" : "Leave"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.scrollContent}>
        {/* Invite code card */}
        <Animated.View
          entering={FadeInDown.delay(60).duration(400).springify()}
          style={[
            styles.codeCard,
            { backgroundColor: colors.card, borderColor: colors.divider },
          ]}
        >
          <Text style={[styles.codeLabel, { color: colors.subtext }]}>
            INVITE CODE
          </Text>
          <Text style={[styles.code, { color: colors.text }]}>{code}</Text>
          <Text style={[styles.codeHint, { color: colors.subtext }]}>
            Share this code with friends to let them join.
          </Text>
          <Pressable
            onPress={handleShareCode}
            style={({ pressed }) => [
              styles.shareBtn,
              {
                backgroundColor: colors.accent,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.shareBtnText, { color: colors.accentText }]}>
              {codeCopied ? "✓ Copied!" : Platform.OS === "web" ? "Copy Code" : "Share Code"}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Members list */}
        <Animated.View
          entering={FadeInDown.delay(120).duration(400).springify()}
          style={styles.membersSection}
        >
          <Text style={[styles.membersTitle, { color: colors.text }]}>
            Players{" "}
            <Text style={{ color: colors.subtext }}>· {members.length}</Text>
          </Text>

          {members.length === 0 ? (
            <View
              style={[
                styles.emptyMembers,
                { backgroundColor: colors.card, borderColor: colors.divider },
              ]}
            >
              <Text style={[styles.emptyText, { color: colors.subtext }]}>
                No players yet. Share the code!
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.membersList,
                { backgroundColor: colors.card, borderColor: colors.divider },
              ]}
            >
              {members.map((member, index) => (
                <Animated.View
                  key={member.id}
                  entering={FadeInRight.delay(index * 40).duration(300).springify()}
                  layout={Layout.springify()}
                  style={[
                    styles.memberRow,
                    index < members.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.divider,
                    },
                  ]}
                >
                  {/* Avatar */}
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: getAvatarColor(member.name, isDark) },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.text }]}>
                      {member.name}
                    </Text>
                    {member.id === memberId && (
                      <Text style={[styles.youBadge, { color: colors.subtext }]}>
                        you
                      </Text>
                    )}
                  </View>

                  {/* Host badge */}
                  {index === 0 && (
                    <View
                      style={[
                        styles.hostBadge,
                        { backgroundColor: colors.accent },
                      ]}
                    >
                      <Text
                        style={[
                          styles.hostBadgeText,
                          { color: colors.accentText },
                        ]}
                      >
                        Host
                      </Text>
                    </View>
                  )}
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Host-only: Start game button */}
        {isHost && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(400).springify()}
            style={styles.startSection}
          >
            <TouchableOpacity
              activeOpacity={0.75}
              disabled={members.length < 1}
              style={[
                styles.startBtn,
                {
                  backgroundColor:
                    members.length >= 1 ? colors.accent : colors.card,
                },
              ]}
              onPress={() => {
                /* TODO: start the game */
                Alert.alert("Coming soon!", "Game start will be added soon.");
              }}
            >
              <Text
                style={[
                  styles.startBtnText,
                  {
                    color:
                      members.length >= 1
                        ? colors.accentText
                        : colors.subtext,
                  },
                ]}
              >
                Start Game
              </Text>
            </TouchableOpacity>
            <Text style={[styles.startHint, { color: colors.subtext }]}>
              You can start whenever everyone has joined.
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

/** Deterministic pastel-ish accent color based on name */
function getAvatarColor(name: string, isDark: boolean): string {
  const colors = isDark
    ? [
        "#3a3a5c",
        "#3c4a3a",
        "#4a3838",
        "#3a4a4a",
        "#4a3a4a",
        "#4a4a3a",
      ]
    : [
        "#d9e8ff",
        "#d9f5e8",
        "#ffd9d9",
        "#d9f5f5",
        "#f5d9f5",
        "#f5f5d9",
      ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  stateTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  stateText: {
    fontSize: 15,
    textAlign: "center",
  },
  goHomeBtn: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 100,
  },
  goHomeBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#30d158",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  leaveText: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === "web" ? 48 : 20,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  codeCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  code: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: 8,
    marginVertical: 4,
  },
  codeHint: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  shareBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 100,
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  membersSection: {
    gap: 12,
    marginBottom: 24,
  },
  membersTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  emptyMembers: {
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
  },
  membersList: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#555555",
  },
  memberInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
  },
  youBadge: {
    fontSize: 12,
    fontWeight: "500",
  },
  hostBadge: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 100,
  },
  hostBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  startSection: {
    gap: 10,
    alignItems: "center",
  },
  startBtn: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnText: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  startHint: {
    fontSize: 13,
    textAlign: "center",
  },
});
