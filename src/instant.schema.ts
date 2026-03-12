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
      // Status: "waiting" | "playing" | "finished"
      status: i.string(),
      createdAt: i.date(),
    }),
    lobbyMembers: i.entity({
      // Display name chosen at join time
      name: i.string(),
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
