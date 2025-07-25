import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "@screens/in-app/bottom-tabs/Dashboard";
import Profile from "@screens/in-app/bottom-tabs/Profile";
import Setting from "@screens/in-app/bottom-tabs/Setting";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUI } from "@context/UiProvider";
import { TouchableOpacity } from "react-native";
import { getFontName } from "@utils/utils";

export type BottomStackParamList = {
  DASHBOARD: undefined;
  SETTING: undefined;
  PROFILE: undefined;
};

const BottomTabs = createBottomTabNavigator<BottomStackParamList>();

const getBottomTabsIcon = (
  routeName: keyof BottomStackParamList,
  color: string,
  size: number,
) => {
  switch (routeName) {
    case "DASHBOARD":
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
  const { theme, toggleTheme, appTheme } = useUI();
  return (
    <BottomTabs.Navigator
      initialRouteName="DASHBOARD"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) =>
          getBottomTabsIcon(route.name, color, size),
        tabBarActiveTintColor: theme.text.primary,
        tabBarInactiveTintColor: theme.descriptionTextColor,
        animation: "shift",
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text.primary },
        tabBarStyle: {
          backgroundColor: theme.background,
        },
        tabBarLabelStyle: {
          fontFamily: getFontName("SemiBold"),
        },
        headerShown: false,
      })}
    >
      <BottomTabs.Screen name="DASHBOARD" component={Dashboard} />
      <BottomTabs.Screen name="PROFILE" component={Profile} />
      <BottomTabs.Screen name="SETTING" component={Setting} />
    </BottomTabs.Navigator>
  );
};

export default BottomTabsNavigator;
