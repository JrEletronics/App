import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons"; // Adicionado MaterialIcons
import Home from "src/screens/Home";
import TeamManagement from "src/screens/Team";
import Services from "src/screens/Services";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

const CustomTabBarIcon = ({
  iconName,
  filledIconName,
  label,
  color,
  size,
  focused,
}) => (
  <View className="flex justify-center items-center gap-1">
    {focused ? (
      <MaterialIcons name={filledIconName} color={color} size={size} />
    ) : (
      <Feather name={iconName} color={color} size={size} />
    )}
    <Text className="text-[12px] font-bold" style={{ color }}>
      {label}
    </Text>
  </View>
);

const AnimatedScreenWrapper = ({ children }) => {
  const opacity = useSharedValue(0);

  useFocusEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 500 });
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const HomeScreen = () => (
  <AnimatedScreenWrapper>
    <Home />
  </AnimatedScreenWrapper>
);

const TeamScreen = () => (
  <AnimatedScreenWrapper>
    <TeamManagement />
  </AnimatedScreenWrapper>
);

const ServicesScreen = () => (
  <AnimatedScreenWrapper>
    <Services />
  </AnimatedScreenWrapper>
);

export default function TabRoutes() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#ffff",
          padding: 10,
          height: 80,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#92929c",
      }}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBarIcon
              iconName="clipboard"
              filledIconName="assignment"
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
        component={TeamScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBarIcon
              iconName="users"
              filledIconName="group"
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
        component={ServicesScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBarIcon
              iconName="briefcase"
              filledIconName="work"
              label="Services"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}