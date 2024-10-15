import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Home from "src/screens/Home";
import New from "src/screens/New";
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
                name="new"
                component={New}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <CustomTabBarIcon iconName="plus" label="Novo" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
