import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { useContext, useState } from "react";
import React from "react";
import Home from "src/screens/Home";
import Services from "src/screens/Services";
import TeamManagementPage from "src/screens/Team";
import { AuthContext } from "src/context/AuthContext";


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    backgroundColor: "#d3d3d375", 
  },
  modalContent: {
    position: "relative",
    width: "100%",
    minHeight: 400,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 5,
    zIndex: 9999,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
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
  logoutButton: {
    flex: 1,
    backgroundColor: "#f44336",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  GenericContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: 10,
    gap: 10,
  },
});

const ProfileModal = ({ visible, onClose }) => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState(user?.password || "");

  const handleSave = async () => {
    if (!name || !email || !password) {
      Alert.alert("Todos os campos são obrigatórios!");
      return;
    }

    const updatedUser = { id: user?.id || "", name, email, password };

    try {
      await updateUser(updatedUser);
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={20} />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Editar Perfil</Text>
          <View style={styles.GenericContainer}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Senha"
              secureTextEntry
            />
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              width: "100%",
              minHeight: 100,
            }}
          >
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.SaveButtonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.SaveButtonText}>Desconectar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const Tab = createBottomTabNavigator();

const CustomTabBarIcon = ({
  iconName,
  filledIconName,
  label,
  color,
  size,
  focused,
}) => (
  <View style={{ justifyContent: "center", alignItems: "center", gap: 4 }}>
    <Feather
      name={focused ? filledIconName : iconName}
      color={color}
      size={size}
    />
    <Text style={{ fontSize: 12, fontWeight: "bold", color }}>{label}</Text>
  </View>
);

export default function TabRoutes() {
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#fff",
            padding: 10,
            height: 80,
            justifyContent: "center",
            alignItems: "center",
          },
          tabBarActiveTintColor: "#000",
          tabBarInactiveTintColor: "#92929c",
        }}
      >
        <Tab.Screen
          name="home"
          component={Home}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <CustomTabBarIcon
                iconName="clipboard"
                filledIconName="clipboard"
                label="Tasks"
                color={color}
                size={size}
                focused={focused}
              />
            ),
          }}
        />
        <Tab.Screen
          name="team"
          component={TeamManagementPage}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <CustomTabBarIcon
                iconName="users"
                filledIconName="users"
                label="Team"
                color={color}
                size={size}
                focused={focused}
              />
            ),
          }}
        />
        <Tab.Screen
          name="services"
          component={Services}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <CustomTabBarIcon
                iconName="briefcase"
                filledIconName="briefcase"
                label="Services"
                color={color}
                size={size}
                focused={focused}
              />
            ),
          }}
        />
        <Tab.Screen
          name="profile"
          component={() => null}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <TouchableOpacity
                onPress={(e) => {
                  e.preventDefault();
                  setProfileModalVisible(true);
                }}
                style={{ justifyContent: "center", alignItems: "center" }}
              >
                <Feather
                  name="user"
                  size={size}
                  color={focused ? color : "#92929c"}
                />
                <Text
                  style={{
                    color: focused ? color : "#92929c",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  Profile
                </Text>
              </TouchableOpacity>
            ),
          }}
        />
      </Tab.Navigator>
      <ProfileModal
        visible={isProfileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </>
  );
}
function setUser(updatedUser: {
  id: string;
  name: string;
  email: string;
  password: string;
}) {
  throw new Error("Function not implemented.");
}
