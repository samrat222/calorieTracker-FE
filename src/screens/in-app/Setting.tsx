import { View, Text } from "react-native";
import React, { FC } from "react";
import CustomButton from "@components/CustomButton";
import { useAuth } from "@context/AuthProvider";

const Setting: FC = () => {
    const {clearToken} = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
     <CustomButton title="Logout" onPress={()=>clearToken()}/>
    </View>
  );
};

export default Setting;
