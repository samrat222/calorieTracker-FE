import { View, Text } from "react-native";
import React, { FC, useEffect, useState } from "react";
import CustomButton from "@components/CustomButton";
import { useAuth } from "@context/AuthProvider";
import { useUI } from "@context/UiProvider";
import switchTheme from "react-native-theme-switch-animation";
import { THEME } from "@utils/colors";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";

const Setting: FC = () => {
  const { clearToken } = useAuth();
  const { appTheme, setAppTheme,theme } = useUI();
  const [localTheme, setLocalTheme] = useState(appTheme);
  const COLOR = THEME[localTheme || 'light'].background;

  useEffect(() => {
    setAppTheme(localTheme);
  }, [localTheme]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: localTheme==='dark'?COLOR:COLOR ,      
        padding: 16,
      }}
    >
      <CustomButton title="Logout" onPress={() => clearToken()} />
      <CustomButton
        title="switch theme"
        onPress={() =>
          switchTheme({
            switchThemeFunction: () => {
              setLocalTheme(localTheme === "light" ? "dark" : "light");
            },
            animationConfig: {
              type: localTheme === "light" ? "circular" : "inverted-circular",
              duration: 1200,
              startingPoint: {
                cx: SCREEN_WIDTH/2,
                cy: 0,
              },
            },
          })
        }
      />
    </View>
  );
};

export default Setting;
