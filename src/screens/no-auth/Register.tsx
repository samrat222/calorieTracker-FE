import { View, Text } from "react-native";
import React, { FC } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import CustomButton from "@components/CustomButton";
import { getNavigation } from "@utils/utils";

const Register: FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, "REGISTER">>();
  const navigation = getNavigation();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <CustomButton
        title="Go to Login"
        onPress={() => navigation.navigate("LOGIN")}
      />
    </View>
  );
};

export default Register;
