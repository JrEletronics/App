import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Home from "src/screens/Home";
import TeamMenbers from "src/screens/Team";
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

const CustomTabBarIcon = ({ iconName, label, color, size }) => (
    <View className="flex justify-center items-center gap-1">
        <Feather name={iconName} color={color} size={size} />
        <Text className="text-[12px] font-bold" style={{ color }}>{label}</Text>
    </View>
);

export default function TabRoutes() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: '#ffff',
                    padding: 10,
                    height: 80,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                },
                tabBarActiveTintColor: '#000',
                tabBarInactiveTintColor: '#92929c',
            }}
        >
            <Tab.Screen
                name="home"
                component={Home}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <CustomTabBarIcon iconName="home" label="Home" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="team"
                component={TeamMenbers}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <CustomTabBarIcon iconName="users" label="Team" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
