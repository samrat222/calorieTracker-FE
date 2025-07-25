import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./context/AuthProvider";
import AppNavigator from "./navigator/AppNavigator";
import { UiProvider } from "./context/UiProvider";
import { CustomBottomSheetProvider } from "@context/CustomBottomSheetProvider";
import { NetworkProvider } from "@context/NetworkProvider";
import React from "react";
import { LogBox } from "react-native";
import UpdateChecker from "@utils/UpdateChecker";
import {
  useFonts,
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  NunitoSans_800ExtraBold,
  NunitoSans_900Black,
} from "@expo-google-fonts/nunito-sans";
import SplashScreen from "@components/SplashScreen";
import { setupBackgroundMessaging } from "@utils/notificationService";
LogBox.ignoreAllLogs(true);

// Setting up the background messaging before App.tsx mounts
setupBackgroundMessaging();

export default function App() {
  let [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
    NunitoSans_900Black,
  });

  if (!fontsLoaded) {
    return <SplashScreen />;
  }
  return (
    <GestureHandlerRootView>
      <UiProvider>
        <UpdateChecker>
          <AuthProvider>
            <CustomBottomSheetProvider>
              <NetworkProvider>
                <AppNavigator />
              </NetworkProvider>
            </CustomBottomSheetProvider>
          </AuthProvider>
        </UpdateChecker>
      </UiProvider>
      <StatusBar style="auto" translucent backgroundColor="transparent" />
    </GestureHandlerRootView>
  );
}
