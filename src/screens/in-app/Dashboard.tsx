import { View, Text } from "react-native";
import React, { FC } from "react";
import { useCustomBottomSheet } from "@context/CustomBottomSheetProvider";
import CustomButton from "@components/CustomButton";
import BottomSheetAction from "@components/BottomSheetAction";

const Dashboard: FC = () => {
  const { showBottomSheet, hideBottomSheet } = useCustomBottomSheet();
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
    <View style={{flex:1,justifyContent:'center',padding:16}}>
      <CustomButton title="Open Bottom Sheet" onPress={handleOpen} />
    </View>
  );
};

export default Dashboard;
