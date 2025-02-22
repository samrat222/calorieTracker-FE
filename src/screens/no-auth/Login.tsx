import { View, Text, Button } from "react-native";
import React, { FC } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { getNavigation } from "@utils/utils";
import { useAuth } from "@context/AuthProvider";

const Login: FC = () => {
  const { token,storeToken } = useAuth();
  const navigation = getNavigation();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button
        onPress={() => navigation.navigate("REGISTER", { userId: "firstUser" })}
        title="Register"
      />
      <Button
        onPress={() => storeToken('my_token')}
        title="Dashboard"
      />
    </View>
  );
};

export default Login;
