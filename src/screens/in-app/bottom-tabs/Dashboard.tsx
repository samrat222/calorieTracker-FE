import React, { FC, useState } from "react";
import { useCustomBottomSheet } from "@context/CustomBottomSheetProvider";
import CustomButton from "@components/CustomButton";
import { Button, View } from "react-native";
import { useUI } from "@context/UiProvider";
import CustomText from "@components/CustomText";

const Dashboard: FC = () => {
  const { showBottomSheet, hideBottomSheet } = useCustomBottomSheet();
  const { theme } = useUI();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 16,
        alignItems: "center",
        backgroundColor: theme.background,
      }}
    >
      <CustomText>Dashboard</CustomText>
    </View>
  );
};

export default Dashboard;
