import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Change this to your server's IP if testing on a physical device
const WS_URL = "ws://localhost:8787/ws";

export default function Index() {
  const [status, setStatus] = useState("Disconnected");

  useEffect(() => {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gameTitleContainer}>
        <Text style={styles.gameTitle}>Brain Brawl</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameTitleContainer: {
    alignItems: "center",
    marginTop: 35,
  },
  gameTitle: {
    fontWeight: "bold",
    fontSize: 32,
  },
});
