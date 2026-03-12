import { DB } from "@/utils/db";
import type { QuizQuestion } from "@/utils/generate-quiz-questions";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Member = {
  id: string;
  name: string;
  avatarUrl?: string;
  score?: number;
  correctAnswers?: number;
  currentAnswerIndex?: number;
  answeredQuestionIndex?: number;
  answeredAt?: number | string;
  joinedAt: number | string;
};

export default function GameScreen() {
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
  const [now, setNow] = useState(Date.now());
  const [isAdvancing, setIsAdvancing] = useState(false);
  const processedRoundKeyRef = useRef<string | null>(null);
  const musicPlayer = useAudioPlayer(
    require("../../../assets/gameAssets/backgroundmusic.mp3"),
  );

  const colors = {
    bg: isDark ? "#000000" : "#ffffff",
    card: isDark ? "#1c1c1e" : "#f2f2f7",
    text: isDark ? "#ffffff" : "#000000",
    subtext: isDark ? "#8e8e93" : "#8e8e93",
    divider: isDark ? "#38383a" : "#e5e5ea",
    accent: isDark ? "#ffffff" : "#000000",
    accentText: isDark ? "#000000" : "#ffffff",
    success: isDark ? "#32d74b" : "#34c759",
  };

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
  const members: Member[] = useMemo(
    () =>
      [...(lobby?.members ?? [])].sort((a: Member, b: Member) =>
        Number(a.joinedAt) < Number(b.joinedAt) ? -1 : 1,
      ),
    [lobby?.members],
  );
  const myMember = members.find((member) => member.id === memberId);

  const questions: QuizQuestion[] = useMemo(() => {
    const payload = lobby?.questionsJson;
    if (!payload || typeof payload !== "string") return [];
    try {
      const parsed = JSON.parse(payload) as QuizQuestion[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [lobby?.questionsJson]);

  const status = (lobby?.status as string | undefined) ?? "waiting";
  const questionIndex = Number(lobby?.currentQuestionIndex ?? 0);
  const timerSeconds = Number(lobby?.timerSeconds ?? 10);
  const currentQuestionStartedAt = Number(
    lobby?.currentQuestionStartedAt ?? Date.now(),
  );
  const currentQuestion = questions[questionIndex];
  const isFinished = status === "finished";
  const hasQuestion = Boolean(currentQuestion);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      // Avoid browser media fetch-abort errors when navigating quickly.
      return;
    }

    async function startBackgroundMusic() {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          interruptionMode: "mixWithOthers",
        });
        musicPlayer.loop = true;
        musicPlayer.volume = 0.18;
        musicPlayer.play();
      } catch {
        // If audio fails (e.g. unsupported platform), keep gameplay unaffected.
      }
    }

    startBackgroundMusic();
  }, [musicPlayer]);

  useEffect(() => {
    if (isLoading || !lobby) return;
    if (status === "waiting") {
      router.replace({
        pathname: "/(screens)/lobby",
        params: { lobbyId, memberId, isHost: isHost ? "true" : "false" },
      });
    }
  }, [isHost, isLoading, lobby, lobbyId, memberId, router, status]);

  const deadline = currentQuestionStartedAt + timerSeconds * 1000;
  const timeLeftMs = Math.max(0, deadline - now);
  const timeLeftSeconds = Math.ceil(timeLeftMs / 1000);
  const hasAnsweredCurrent =
    Number(myMember?.answeredQuestionIndex ?? -1) === questionIndex;
  const selectedIndex = hasAnsweredCurrent
    ? Number(myMember?.currentAnswerIndex ?? -1)
    : -1;

  async function submitAnswer(answerIndex: number) {
    if (!lobby || !currentQuestion || isFinished || hasAnsweredCurrent) return;
    try {
      await DB.transact(
        DB.tx.lobbyMembers[memberId].update({
          currentAnswerIndex: answerIndex,
          answeredQuestionIndex: questionIndex,
          answeredAt: Date.now(),
        }),
      );
    } catch {
      Alert.alert("Error", "Could not submit answer.");
    }
  }

  async function advanceRound() {
    if (!lobby || !currentQuestion || isAdvancing) return;
    setIsAdvancing(true);
    const roundKey = `${questionIndex}-${currentQuestionStartedAt}`;
    processedRoundKeyRef.current = roundKey;

    try {
      const scoreTxns = members.map((member) => {
        const answerQIndex = Number(member.answeredQuestionIndex ?? -1);
        const answerIndex = Number(member.currentAnswerIndex ?? -1);
        const answeredThisRound = answerQIndex === questionIndex;
        const isCorrect =
          answeredThisRound && answerIndex === currentQuestion.correctIndex;
        const gainedPoints = isCorrect ? 100 : 0;

        return DB.tx.lobbyMembers[member.id].update({
          score: Number(member.score ?? 0) + gainedPoints,
          correctAnswers:
            Number(member.correctAnswers ?? 0) + (isCorrect ? 1 : 0),
          currentAnswerIndex: -1,
          answeredQuestionIndex: -1,
          answeredAt: 0,
        });
      });

      const nextIndex = questionIndex + 1;
      const lobbyUpdate =
        nextIndex >= questions.length
          ? DB.tx.lobbies[lobbyId].update({
              status: "finished",
              finishedAt: Date.now(),
            })
          : DB.tx.lobbies[lobbyId].update({
              currentQuestionIndex: nextIndex,
              currentQuestionStartedAt: Date.now(),
            });

      await DB.transact([...scoreTxns, lobbyUpdate]);
    } catch {
      Alert.alert("Error", "Could not continue to next round.");
    } finally {
      setIsAdvancing(false);
    }
  }

  useEffect(() => {
    if (!isHost || !currentQuestion || status !== "playing") return;
    // Small grace period helps absorb minor device clock drift.
    if (deadline - now > -800) return;
    const roundKey = `${questionIndex}-${currentQuestionStartedAt}`;
    if (processedRoundKeyRef.current === roundKey) return;
    advanceRound();
  }, [
    currentQuestion,
    currentQuestionStartedAt,
    deadline,
    isHost,
    now,
    questionIndex,
    status,
  ]);

  const rankedMembers = [...members].sort(
    (a, b) => Number(b.score ?? 0) - Number(a.score ?? 0),
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.text} />
          <Text style={[styles.helperText, { color: colors.subtext }]}>
            Loading game...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !lobby) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
        <View style={styles.centered}>
          <Text style={[styles.title, { color: colors.text }]}>
            Game not found
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(screens)")}
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.primaryBtnText, { color: colors.accentText }]}>
              Go Home
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <View
          style={[
            styles.topCard,
            { backgroundColor: colors.card, borderColor: colors.divider },
          ]}
        >
          <Text style={[styles.roundText, { color: colors.subtext }]}>
            {isFinished
              ? "Final Results"
              : `Question ${Math.min(questionIndex + 1, Math.max(questions.length, 1))} / ${Math.max(questions.length, 1)}`}
          </Text>
          {!isFinished && (
            <Text
              style={[
                styles.timer,
                { color: timeLeftSeconds <= 3 ? "#ff453a" : colors.text },
              ]}
            >
              {timeLeftSeconds}s
            </Text>
          )}
        </View>

        {!isFinished && hasQuestion && (
          <View
            style={[
              styles.questionCard,
              { backgroundColor: colors.card, borderColor: colors.divider },
            ]}
          >
            <Text style={[styles.questionCategory, { color: colors.subtext }]}>
              {(currentQuestion.category ?? "General").toUpperCase()}
            </Text>
            <Text style={[styles.questionPrompt, { color: colors.text }]}>
              {currentQuestion.prompt}
            </Text>
            <View style={styles.answersWrap}>
              {currentQuestion.options.map((option, index) => {
                const isMine = selectedIndex === index;
                return (
                  <Pressable
                    key={`${currentQuestion.id}-${index}`}
                    disabled={hasAnsweredCurrent || timeLeftMs <= 0}
                    onPress={() => submitAnswer(index)}
                    style={[
                      styles.answerBtn,
                      {
                        backgroundColor: isMine ? colors.accent : colors.bg,
                        borderColor: isMine ? colors.accent : colors.divider,
                        opacity: hasAnsweredCurrent && !isMine ? 0.6 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.answerText,
                        { color: isMine ? colors.accentText : colors.text },
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text
              style={[
                styles.helperText,
                { color: hasAnsweredCurrent ? colors.success : colors.subtext },
              ]}
            >
              {hasAnsweredCurrent
                ? "Answer locked in. Waiting for next question..."
                : "Tap an answer before the timer ends."}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.leaderboardCard,
            { backgroundColor: colors.card, borderColor: colors.divider },
          ]}
        >
          <Text style={[styles.leaderboardTitle, { color: colors.text }]}>
            Live Scoreboard
          </Text>
          {rankedMembers.map((member, index) => (
            <View
              key={member.id}
              style={[
                styles.row,
                index < rankedMembers.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.divider,
                },
              ]}
            >
              <View style={styles.rowLeft}>
                <Text style={[styles.rankText, { color: colors.subtext }]}>
                  {index + 1}.
                </Text>
                <Text style={[styles.memberName, { color: colors.text }]}>
                  {member.name}
                  {member.id === memberId ? " (you)" : ""}
                </Text>
              </View>
              <Text style={[styles.scoreText, { color: colors.text }]}>
                {Number(member.score ?? 0)}
              </Text>
            </View>
          ))}
        </View>

        {isFinished && (
          <TouchableOpacity
            onPress={() => router.replace("/(screens)")}
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.primaryBtnText, { color: colors.accentText }]}>
              Back To Home
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  topCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roundText: {
    fontSize: 14,
    fontWeight: "600",
  },
  timer: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  questionCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14,
  },
  questionCategory: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  questionPrompt: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  answersWrap: {
    gap: 10,
  },
  answerBtn: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  answerText: {
    fontSize: 16,
    fontWeight: "600",
  },
  helperText: {
    fontSize: 13,
  },
  leaderboardCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 20,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "700",
  },
  primaryBtn: {
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
});
