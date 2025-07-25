import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import CustomText from "@components/CustomText";
import CustomButton from "@components/CustomButton";
import { getFontName, getNavigation } from "@utils/utils";
import { useAuth } from "@context/AuthProvider";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useUI } from "@context/UiProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { API_BASE_URL, SYSTEM_TOKEN } from "src/constants/constants";

const Register = () => {
  const navigation = getNavigation();
  const { showToast, theme } = useUI();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNo: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email format";

    if (!form.phoneNo.trim()) newErrors.phoneNo = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phoneNo))
      newErrors.phoneNo = "Phone must be 10 digits";

    if (!form.password.trim()) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    // if (!validate()) return;

    // Uncomment the following lines to enable actual registration

    // try {
    //   setLoading(true);
    //   const response = await fetch(`${API_BASE_URL}/user/register`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "x-jwt-assertion": SYSTEM_TOKEN,
    //     },
    //     body: JSON.stringify({
    //       ...form,
    //       roleID: 3,
    //     }),
    //   });

    //   const json = await response.json();

    //   if (response.ok) {
    //     showToast({
    //       message: "Registration successful. Please login",
    //       title: "Success",
    //       success: true,
    //     });
    //     console.log("Registration successful:", json);
    //     setForm({ fullName: "", email: "", phoneNo: "", password: "" });
    //   } else {
    //     console.warn("Registration failed:", json);
    //     if (json.responseCode === 100014) {
    //       showToast({
    //         message: "User already exists",
    //         title: "Failed",
    //         success: false,
    //       });
    //     } else {
    //       showToast({
    //         message: "Registration failed",
    //         title: "Failed",
    //         success: false,
    //       });
    //     }
    //   }
    // } catch (err) {
    //   console.error(err);
    //   showToast({
    //     message: "Please try again later",
    //     title: "Network Error",
    //     success: false,
    //   });
    // } finally {
    //   setLoading(false);
    // }
    showToast({
      message: "Registration successful. Please login",
      title: "Success",
      success: true,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <CustomText font="SemiBold" style={styles.header}>
          Create your Account
        </CustomText>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#888"
          value={form.fullName}
          onChangeText={(v) => handleChange("fullName", v)}
          style={styles.input}
        />
        {errors.fullName && (
          <CustomText style={styles.error}>{errors.fullName}</CustomText>
        )}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          value={form.email}
          onChangeText={(v) => handleChange("email", v)}
          style={styles.input}
          keyboardType="email-address"
        />
        {errors.email && (
          <CustomText style={styles.error}>{errors.email}</CustomText>
        )}

        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#888"
          value={form.phoneNo}
          maxLength={10}
          onChangeText={(v) => handleChange("phoneNo", v)}
          style={styles.input}
          keyboardType="number-pad"
        />
        {errors.phoneNo && (
          <CustomText style={styles.error}>{errors.phoneNo}</CustomText>
        )}
        <View style={{ flexDirection: "row" }}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            value={form.password}
            onChangeText={(v) => handleChange("password", v)}
            style={[styles.input, { width: "100%" }]}
            secureTextEntry={!showPassword}
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
        {errors.password && (
          <CustomText style={styles.error}>{errors.password}</CustomText>
        )}

        <CustomButton
          title="Register"
          onPress={handleRegister}
          style={[styles.button, { backgroundColor: "#4f46e5" }]}
          loading={loading}
        />

        <CustomButton
          title="Go to Login"
          onPress={() => navigation.navigate("LOGIN")}
          style={[{ marginTop: 10 }]}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  inner: {
    padding: 24,
    justifyContent: "center",
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    marginBottom: 30,
    color: "#fff",
  },
  input: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: getFontName("Regular"),
    fontSize: 14,
    color: "#fff",
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
  error: {
    color: "#e2e2e2",
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 4,
  },
});
