import React, { FC, useState } from "react";
import { useCustomBottomSheet } from "@context/CustomBottomSheetProvider";
import CustomButton from "@components/CustomButton";
import BottomSheetAction from "@components/BottomSheetAction";
import { Button, View } from "react-native";
import { useUI } from "@context/UiProvider";


const Dashboard: FC = () => {
  const { showBottomSheet, hideBottomSheet } = useCustomBottomSheet();
  const {theme} = useUI();
  const handleOpen = async () => {
    await showBottomSheet({
      view: (
        <BottomSheetAction
          icon="check"
          message="Done"
          onPress={hideBottomSheet}
          onPressTitle="Done"
        />
      ),
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 16,backgroundColor:theme.background }}>
      <CustomButton title="Open Bottom Sheet" onPress={handleOpen} />
    </View>
  );
};

export default Dashboard;
