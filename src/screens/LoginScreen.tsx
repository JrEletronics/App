import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen({ navigation }: any) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");
    if (!email || !password) {
      setErrorMessage("Por favor, preencha todos os campos!");
      return;
    }
    const isLoggedIn = await login(email, password);
    if (isLoggedIn) {
      setEmail("");
      setPassword("");
    } else {
      setErrorMessage("Email ou senha incorretos!");
    }
  };

  return (
    <SafeAreaView style={styles.MainContainer}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}

      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "100%",
          minHeight: 100,
        }}
      >
        <TouchableOpacity onPress={handleLogin} style={styles.saveButton}>
          <Text style={styles.SaveButtonText}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={styles.saveButton}
        >
          <Text style={styles.SaveButtonText}>Registre-se</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#eeeeee",
    justifyContent: "center",
    alignContent: "center",
    gap: 10,
    padding: 10,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 10,
    height: 40,
    backgroundColor: "#fff",
  },
  LoadAnimation: {
    marginBottom: 20,
  },
  MessageContent: {
    marginTop: 20,
  },
  MessageText: {
    fontSize: 18,
    color: "#6200ea",
    fontWeight: "bold",
  },
  errorMessage: {
    fontSize: 16,
    color: "red",
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#6200ea",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  SaveButtonText: {
    fontSize: 16,
    color: "#fff",
  },
});
