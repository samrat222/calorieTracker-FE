import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./context/AuthProvider";
import AppNavigator from "./navigator/AppNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import { UiProvider } from "./context/UiProvider";
import { CustomBottomSheetProvider } from "@context/CustomBottomSheetProvider";
import { NetworkProvider } from "@context/NetworkProvider";
import React from "react";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <UiProvider>
            <CustomBottomSheetProvider>
              <NetworkProvider>
                <AppNavigator />
              </NetworkProvider>
            </CustomBottomSheetProvider>
          </UiProvider>
        </SafeAreaView>
      </AuthProvider>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
