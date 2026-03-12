// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react-native";

const rules = {
  lobbies: {
    allow: {
      // Anyone can view lobbies (needed to validate invite codes)
      view: "true",
      // Anyone (even guests) can create a lobby
      create: "true",
      // Only allow updates (e.g. status changes) — open for now
      update: "true",
      // Only allow the creator to delete — we store hostMemberId on the lobby
      // for now we keep it open; lock down later
      delete: "true",
    },
  },
  lobbyMembers: {
    allow: {
      view: "true",
      create: "true",
      update: "true",
      delete: "true",
    },
  },
} satisfies InstantRules;

export default rules;
