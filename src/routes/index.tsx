import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import TabRoutes from "./tab.routes";
import LoginScreen from "src/screens/LoginScreen";
import RegisterScreen from "src/screens/RegisterScreen";
import { AuthContext, AuthProvider } from "../context/AuthContext";

const Stack = createStackNavigator();

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={TabRoutes} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function Routes() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
