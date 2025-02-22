import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import React, { FC, useState } from "react";

import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUI } from "@context/UiProvider";
import { getFontName } from "@utils/utils";
import ErrorMessage from "./ErrorMessage";

interface InputTextFieldProps extends TextInputProps {
  placeholder?: string;
  value: React.ComponentState;
  onChangeText: (text: string) => void;
  required?: boolean;
  label: string;
  secureEntry?: boolean;
  disableColor?: string;
  labelColor?: string;
  inputColor?: string;
  borderColor?: string;
  borderWidth?: number | undefined;
  errorMessage?: string;
}

const CustomInputTextField: FC<InputTextFieldProps> = ({
  labelColor,
  inputColor,
  borderColor,
  borderWidth,
  label,
  disableColor,
  secureEntry,
  placeholder,
  required,
  value,
  errorMessage,
  onChangeText,
  ...rest
}) => {
  const { theme } = useUI();
  const [isPasswordSecure, setIsPasswordSecure] = useState(secureEntry);
  const [isFocused, setIsFocused] = useState(false);

  const Styles = StyleSheet.create({
    Row: {
      padding: 0,
      gap: 8,
    },
    LabelRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    LabelRowLeft: {
      marginRight: 4,
    },
    Label: {
      color: labelColor || theme.text.primary,
      fontFamily: getFontName("Regular"),
      fontSize: RFValue(14),
      lineHeight: 22,
    },
    InputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: borderWidth || 1,
      borderColor: errorMessage
        ? "red"
        : isFocused
        ? theme.primary
        : borderColor || theme.inputTextFieldBorderColor,
      borderRadius: 5,
      height: 48,
      paddingHorizontal: 16,
      color: theme.text.secondary,
    },
    Input: {
      flex: 1,
      color: inputColor || theme.inputTextColor,
      fontFamily: getFontName("Regular"),
      fontSize: RFValue(12),
    },
    IconContainer: {
      marginLeft: 10,
    },
  });

  return (
    <View style={Styles.Row}>
      <View style={Styles.LabelRow}>
        <View style={Styles.LabelRowLeft}>
          <Text style={Styles.Label}>{label}</Text>
        </View>
        <View>
          <Text style={{ ...Styles.Label, color: theme.red }}>
            {required ? "*" : ""}
          </Text>
        </View>
      </View>
      <View style={[Styles.InputContainer, { backgroundColor: disableColor }]}>
        <TextInput
          style={Styles.Input}
          autoCapitalize="none"
          secureTextEntry={isPasswordSecure}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={theme.inputPlaceholderColor}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {secureEntry && (
          <TouchableOpacity
            style={Styles.IconContainer}
            onPress={() => setIsPasswordSecure(!isPasswordSecure)}
          >
            <MaterialCommunityIcons
              name={isPasswordSecure ? "eye-off" : "eye"}
              size={24}
              color={theme.primary}
            />
          </TouchableOpacity>
        )}
      </View>
      {errorMessage && <ErrorMessage message={errorMessage} />}
    </View>
  );
};

export default CustomInputTextField;
