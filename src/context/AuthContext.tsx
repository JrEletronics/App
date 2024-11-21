import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: async () => false,
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {}, // Adiciona a função no contexto
});


interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading user from AsyncStorage", error);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        if (parsedUser.email === email && parsedUser.password === password) {
          setUser(parsedUser);
          return true;
        }
      }
    } catch (error) {
      console.error("Error during login", error);
    }
    return false;
  };

  const register = async (newUser: User) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      setUser(null);
    } catch (error) {
      console.error("Error during registration", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
