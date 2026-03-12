// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react-native";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $streams: i.entity({
      abortReason: i.string().optional(),
      clientId: i.string().unique().indexed(),
      done: i.boolean().optional(),
      size: i.number().optional(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    lobbies: i.entity({
      // 6-character uppercase invite code, e.g. "ABC123"
      code: i.string().unique().indexed(),
      // Display name of the host
      hostName: i.string(),
      // Host member id for permissions/badges in lobby UI
      hostMemberId: i.string(),
      // Status: "waiting" | "playing" | "finished"
      status: i.string(),
      // Editable host settings
      category: i.string(),
      questionCount: i.number(),
      timerSeconds: i.number(),
      maxPlayers: i.number(),
      // Serialized question payload for this lobby session
      questionsJson: i.string().optional(),
      // Runtime state
      currentQuestionIndex: i.number().optional(),
      currentQuestionStartedAt: i.date().optional(),
      startedAt: i.date().optional(),
      finishedAt: i.date().optional(),
      createdAt: i.date(),
    }),
    lobbyMembers: i.entity({
      // Display name chosen at join time
      name: i.string(),
      // Remote avatar image URL
      avatarUrl: i.string().optional(),
      // Runtime game stats
      score: i.number().optional(),
      correctAnswers: i.number().optional(),
      currentAnswerIndex: i.number().optional(),
      answeredQuestionIndex: i.number().optional(),
      answeredAt: i.date().optional(),
      joinedAt: i.date(),
    }),
  },
  links: {
    $streams$files: {
      forward: {
        on: "$streams",
        has: "many",
        label: "$files",
      },
      reverse: {
        on: "$files",
        has: "one",
        label: "$stream",
        onDelete: "cascade",
      },
    },
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    // A lobby has many members; each member belongs to exactly one lobby
    lobbyHasMembers: {
      forward: { on: "lobbies", has: "many", label: "members" },
      reverse: {
        on: "lobbyMembers",
        has: "one",
        label: "lobby",
        onDelete: "cascade",
      },
    },
  },
  rooms: {},
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
