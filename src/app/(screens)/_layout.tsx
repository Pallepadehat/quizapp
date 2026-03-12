import { Stack } from "expo-router";

export default function ScreenLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create-lobby" options={{ headerShown: false }} />
      <Stack.Screen name="join-lobby" options={{ headerShown: false }} />
      <Stack.Screen name="lobby" options={{ headerShown: false }} />
    </Stack>
  );
}
