import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { RFValue } from "react-native-responsive-fontsize";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { FC } from "react";
import { useUI } from "@context/UiProvider";
import { getFontName } from "@utils/utils";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
  loading?: boolean;
  iconSize?: number;
  textSize?: number;
  textColor?: string;
  textStyle?: StyleProp<TextStyle>;
}

const CustomButton: FC<CustomButtonProps> = ({
  title,
  onPress,
  color,
  style,
  icon,
  textColor,
  textSize,
  iconColor,
  loading,
  iconSize,
  textStyle,
  ...rest
}) => {
  const { theme } = useUI();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={[
        {
          paddingVertical: 0,
          borderRadius: 12,
          height: 50,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: loading ? theme.disabled : color || theme.primary,
          flexDirection: "row",
          gap: 8,
        },
        style,
      ]}
      {...rest}
    >
      {icon && (
        <MaterialCommunityIcons
          style={{ top: 1 }}
          name={icon}
          color={iconColor}
          size={iconSize}
        />
      )}
      <Text
        style={[
          {
            fontFamily: getFontName("SemiBold"),
            fontSize: RFValue(textSize || 14),
            color: textColor || "#fff",
            margin: 0,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
