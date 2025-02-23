import { Button, View } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "@screens/no-auth/Login";
import { NavigationContainer } from "@react-navigation/native";
import Register from "@screens/no-auth/Register";
import { useAuth } from "@context/AuthProvider";
import BottomTabsNavigator from "./BottomTabsNavigator";
import { navigationRef } from "@utils/utils";
import NetworkLogsTracker from "@components/NetworkLogsTracker";
import { BUILD_FOR_PRODUCTION } from "src/constants/constants";
import { useUI } from "@context/UiProvider";
import switchTheme from "react-native-theme-switch-animation";

const RootStack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { token } = useAuth();

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {token ? (
            <RootStack.Group>
              <RootStack.Screen
                name="DASHBOARD"
                component={BottomTabsNavigator}
              />
            </RootStack.Group>
          ) : (
            <RootStack.Group>
              <RootStack.Screen name="LOGIN" component={Login} />
              <RootStack.Screen name="REGISTER" component={Register} />
            </RootStack.Group>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
      {!BUILD_FOR_PRODUCTION && <NetworkLogsTracker />}
    </>
  );
};

export default AppNavigator;
