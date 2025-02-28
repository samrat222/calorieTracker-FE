import { TouchableOpacity } from "react-native";
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import BottomTabsNavigator from "./BottomTabsNavigator";
import Profile from "@screens/in-app/Profile";
import Setting from "@screens/in-app/Setting";
import { useUI } from "@context/UiProvider";
import { Moon, Sun } from "lucide-react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { theme, toggleTheme, appTheme } = useUI();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: theme.background,
          width: 250,
        },
        drawerActiveTintColor: theme.green,
        drawerInactiveTintColor: theme.red,
        drawerLabelStyle: { color: theme.text.primary },
        drawerIcon: ({ focused, size }) => {
          const iconColor = theme.text.primary;
          return (
            <MaterialCommunityIcons
              name="account"
              size={size}
              color={iconColor}
            />
          );
        },
        headerTintColor: theme.text.primary,
        headerRight: () => (
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
            {appTheme === "light" ? (
              <Moon size={24} color="#000" />
            ) : (
              <Sun size={24} color="#fff" />
            )}
          </TouchableOpacity>
        ),
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text.primary },
      }}
    >
      <Drawer.Group>
        <Drawer.Screen
          name="Home"
          component={BottomTabsNavigator}




          
        />
        <Drawer.Screen name="Profile" component={Profile} />
        <Drawer.Screen name="Setting" component={Setting} />
      </Drawer.Group>
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
