import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "@screens/no-auth/Login";
import { NavigationContainer } from "@react-navigation/native";
import Register from "@screens/no-auth/Register";
import { useAuth } from "@context/AuthProvider";
import { getFontName, navigationRef } from "@utils/utils";
import NetworkLogsTracker from "@components/NetworkLogsTracker";
import { BUILD_FOR_PRODUCTION } from "src/constants/constants";
import DrawerNavigator from "./DrawerNavigator";
import SplashScreen from "@components/SplashScreen";
import {
  handleNotificationNavigation,
  messaging,
} from "@utils/notificationService";
import Notification from "@screens/in-app/general/Notification";
import { BottomStackParamList } from "./BottomTabsNavigator";

export type RootStackParamList = {
  LOGIN: undefined;
  REGISTER: undefined;
  PROFILE: undefined;
  SETTING: undefined;
  DASHBOARD: BottomStackParamList;
  NOTIFICATION: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  const onReady = async () => {
    try {
      const initialNotification = await messaging.getInitialNotification();
      if (initialNotification) {
        console.log(
          "opening notification from killed state:",
          initialNotification,
        );
        handleNotificationNavigation(initialNotification.data);
      }
    } catch (error) {
      console.log("Error handling initial notification:", error);
    }
  };

  return (
    <>
      <NavigationContainer ref={navigationRef} onReady={onReady}>
        <RootStack.Navigator
          screenOptions={{
            animation: "slide_from_right",
          }}
        >
          {token ? (
            <RootStack.Group
              screenOptions={{
                headerTitleStyle: { fontFamily: getFontName("SemiBold") },
              }}
            >
              <RootStack.Screen
                name="DASHBOARD"
                component={DrawerNavigator}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="NOTIFICATION"
                component={Notification}
                options={{ headerTitle: "Notification" }}
              />
            </RootStack.Group>
          ) : (
            <RootStack.Group screenOptions={{ headerShown: false }}>
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
