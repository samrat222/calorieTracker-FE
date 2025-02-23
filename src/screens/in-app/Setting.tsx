import { View } from "react-native";
import React, { FC } from "react";
import CustomButton from "@components/CustomButton";
import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import switchTheme from "react-native-theme-switch-animation";

const Setting: FC = () => {
  const { clearToken } = useAuth();
  const { theme, toggleTheme, setAppTheme, appTheme } = useUI();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.background,
        padding: 16,
      }}
    >
      <CustomButton title="Logout" onPress={clearToken} />

      <CustomButton title="Switch Theme" onPress={toggleTheme} />
    </View>
  );
};

export default Setting;
