import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen({ navigation }: any) {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAnimation, setLoadingAnimation] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const generateSixDigitCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleRegister = async () => {
    if (name && email && password) {
      setLoading(true);
      setLoadingAnimation(true);

      const newUser = { id: generateSixDigitCode(), name, email, password };

      try {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await register(newUser);

        setLoadingAnimation(false);
        setMessage("Registro bem-sucedido!");

        setTimeout(() => {
          navigation.navigate("Login");
        }, 3000);
      } catch (error) {
        setMessage("Erro ao registrar. Tente novamente.");
      }
    } else {
      setErrorMessage("Preencha todos os campos!");
    }
  };

  return (
    <SafeAreaView style={styles.MainContainer}>
      {loading ? (
        <>
          {loadingAnimation && (
            <ActivityIndicator
              style={styles.LoadAnimation}
              size={100}
              color="#6200ea"
            />
          )}
          {message && (
            <View style={styles.MessageContent}>
              <Text style={styles.MessageText}>{message}</Text>
            </View>
          )}
        </>
      ) : (
        <>
          <Text style={styles.title}>Registrar</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={name}
            onChangeText={setName}
          />
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
          {errorMessage && (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          )}
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              width: "100%",
              minHeight: 100,
            }}
          >
            <TouchableOpacity
              onPress={handleRegister}
              style={styles.saveButton}
            >
              <Text style={styles.SaveButtonText}>Registrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.saveButton}
            >
              <Text style={styles.SaveButtonText}>Voltar ao login</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#eeeeee",
    justifyContent: "center",
    alignItems: "center",
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  MessageText: {
    fontSize: 18,
    color: "#6200ea",
    fontWeight: "bold",
    textAlign: "center"
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
