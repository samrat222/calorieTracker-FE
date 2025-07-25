import React, { FC, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { getFontName, getNavigation } from "@utils/utils";
import { useAuth } from "@context/AuthProvider";
import CustomButton from "@components/CustomButton";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import CustomText from "@components/CustomText";
import { useFetch } from "src/hooks/useFetch";
import { useUI } from "@context/UiProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@navigator/AppNavigator";

const Login: FC = () => {
  const { storeToken, deviceId, fcmToken } = useAuth();
  const navigation = useNavigation<any>();
  const { fetchData } = useFetch({ autoFetch: false });
  const [email, setEmail] = useState("harya72@gmail.com");
  const [password, setPassword] = useState("Welcome01#");
  const [loading, setLoading] = useState(false);
  const { showToast, theme } = useUI();
  const [showPassword, setShowPassword] = useState(false);

  const sendFcmToBackend = async (token: string) => {
    try {
      const response: any = await fetchData(
        `/notification/token`,
        "POST",
        {
          deviceType: Platform.OS,
          token: fcmToken,
          deviceId: deviceId,
        },
        false,
        token,
      );

      if (response?.result?.responseCode === 200) {
        console.log("FCM token sent successfully:", response);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error sending FCM token:", error);
      return false;
    }
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    // Uncomment the following lines to enable actual login

    // setLoading(true);
    // try {
    //   const response: any = await fetchData(`/login`, "POST", {
    //     username: email,
    //     password,
    //     platformId: Platform.OS === "android" ? 1 : 2,
    //     installedAt: "",
    //   });

    //   console.log("Login response:", response);
    //   if (response?.accessToken) {
    //     if (response.accessToken && fcmToken) {
    //       const fcmSent = await sendFcmToBackend(response.accessToken);
    //       if (!fcmSent) {
    //         showToast({
    //           message: "Failed to send FCM token to server",
    //           success: false,
    //           title: "Error",
    //         });
    //       } else {
    //         storeToken(response.accessToken);
    //       }
    //     }
    //   } else {
    //     showToast({
    //       message: "Invalid credentials",
    //       success: false,
    //       title: "Login Failed",
    //     });
    //   }
    // } catch (err) {
    //   console.error("Login error:", err);
    //   showToast({
    //     message: "Something went wrong",
    //     success: false,
    //     title: "Error",
    //   });
    // } finally {
    //   setLoading(false);
    // }
    storeToken("dummy-token"); // For testing purposes only
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <CustomText font="SemiBold" style={styles.header}>
        Login to your Account
      </CustomText>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#888"
        style={styles.input}
      />

      <View style={{ flexDirection: "row" }}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#888"
          style={styles.input}
        />
        <TouchableOpacity
          style={{ padding: 10, position: "absolute", right: 0, top: 0 }}
          onPress={() => setShowPassword(!showPassword)}
        >
          <MaterialCommunityIcons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>

      <CustomButton
        title={loading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        loading={loading}
        style={[styles.button]}
      />
      <View style={{ height: 12 }} />

      <CustomButton
        onPress={() => navigation.navigate("REGISTER")}
        title="Go to Register"
        style={[styles.button, { backgroundColor: "#4f46e5" }]}
      />
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#111",
  },
  header: {
    fontSize: 24,
    marginBottom: 30,
    color: "#fff",
  },
  button: {
    marginTop: 20,
    paddingVertical: 14,
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    width: "100%",
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    marginBottom: 16,
    fontFamily: getFontName("Regular"),
  },
});
