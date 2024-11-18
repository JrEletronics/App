import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Routes from "src/routes";
import LottieView from "lottie-react-native";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const animation = useRef<LottieView>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashText}>Bem-vindo ao App!</Text>
        <LottieView
          autoPlay
          ref={animation}
          style={{
            width: 200,
            height: 200,
          }}
          source={require("./public/animations/Animation.json")}
        />
      </View>
    );
  }

  return <Routes />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  splashText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
});
