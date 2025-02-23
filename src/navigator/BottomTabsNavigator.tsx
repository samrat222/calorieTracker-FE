import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "@screens/in-app/Dashboard";
import Profile from "@screens/in-app/Profile";
import Setting from "@screens/in-app/Setting";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUI } from "@context/UiProvider";

const BottomTabs = createBottomTabNavigator<BottomStackParamList>();

const getBottomTabsIcon = (
  routeName: keyof BottomStackParamList,
  color: string,
  size: number
) => {
  switch (routeName) {
    case "HOME":
      return <MaterialCommunityIcons name="home" size={size} color={color} />;
    case "PROFILE":
      return (
        <MaterialCommunityIcons name="account" size={size} color={color} />
      );
    case "SETTING":
      return <MaterialCommunityIcons name="cog" size={size} color={color} />;
    default:
      return <MaterialCommunityIcons name="home" size={size} color={color} />;
  }
};

const BottomTabsNavigator = () => {
  const { theme } = useUI();
  return (
    <BottomTabs.Navigator
      initialRouteName="HOME"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) =>
          getBottomTabsIcon(route.name, color, size),
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text.secondary,
        animation: "shift",
      })}
    >
      <BottomTabs.Screen name="HOME" component={Dashboard} />
      <BottomTabs.Screen name="PROFILE" component={Profile} />
      <BottomTabs.Screen name="SETTING" component={Setting} />
    </BottomTabs.Navigator>
  );
};

export default BottomTabsNavigator;
