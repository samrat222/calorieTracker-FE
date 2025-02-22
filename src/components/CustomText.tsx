import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";
import React, { FC } from "react";
import { RFValue } from "react-native-responsive-fontsize";
import { getFontName } from "@utils/utils";
import { useUI } from "@context/UiProvider";




interface CustomTextProps {
  children: string | React.ReactNode;
  style?: StyleProp<TextStyle>;
  font?:keyof font
}


const CustomText: FC<CustomTextProps> = ({ style, children,font }) => {
  const { theme } = useUI();
  return (
    <Text
      style={[styles.defaultText, { color: theme.text.primary },{fontFamily:getFontName(font || "Regular")}, style]}
    >
      {children}
    </Text>
  );
};

export default CustomText;

const styles = StyleSheet.create({
  defaultText: {
    fontSize: RFValue(14),
  },
});
