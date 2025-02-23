import { View, Modal, ActivityIndicator } from "react-native";
import React from "react";
import { THEME } from "@utils/colors";



const FullscreenLoader = ({ show,theme }: { show: boolean,theme:(typeof THEME)[ThemeMode] }) => {
  return (
    <Modal animationType="fade" transparent visible={show}>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.68)",
        }}
      >
        <ActivityIndicator size={"large"} color={theme.primary} />
      </View>
    </Modal>
  );
};

export default FullscreenLoader;
