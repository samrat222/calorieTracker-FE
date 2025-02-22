import { View, Text, ViewStyle, TextStyle } from "react-native";
import React, { FC } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUI } from "@context/UiProvider";
import { MotiView } from "moti";
import CustomText from "./CustomText";
import { RFValue } from "react-native-responsive-fontsize";
import CustomButton from "./CustomButton";
import { withSpring } from "react-native-reanimated";
import { BottomSheetView } from "@gorhom/bottom-sheet";

interface BottomSheetActionProps {
  message: string;
  onPress: () => void;
  onCancel?: () => void;
  onCancelText?: string;
  onPressTitle: string;
  onCancelButtonStyle?: ViewStyle;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconStyle?: ViewStyle;
  onPressStyle?: ViewStyle;
  iconSize?: number;
  messageStyle?: TextStyle;
  iconColor?: string;
}

const BottomSheetAction: FC<BottomSheetActionProps> = ({
  message,
  onPress,
  onCancel,
  icon,
  iconStyle,
  iconColor = "white",
  iconSize = 36,
  messageStyle,
  onCancelText,
  onPressStyle,
  onCancelButtonStyle,
  onPressTitle,
}) => {
  const { theme } = useUI();
  return (
    <BottomSheetView
      style={{
        alignItems: "center",
        gap: 24,
        paddingVertical: 24,
        paddingHorizontal: 16,
      }}
    >
      <MotiView
        style={[
          {
            padding: 16,
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.green,
          },
          iconStyle,
        ]}
        from={{scale:1}}
        animate={{scale:1.5}}
        transition={{type:'spring',damping:8,stiffness:200}}
      >
        <MaterialCommunityIcons name={icon} color={iconColor} size={iconSize} />
      </MotiView>
      <CustomText
        style={[{ fontSize: RFValue(18) }, messageStyle]}
        font="SemiBold"
      >
        {message}
      </CustomText>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 32,
          alignItems: "center",
        }}
      >
        {onCancelText && onCancel && (
          <CustomButton
            title={onCancelText}
            onPress={onCancel}
            style={[{ flex: 1, backgroundColor: "#ddd" }, onCancelButtonStyle]}
          />
        )}
        <CustomButton
          onPress={onPress}
          style={[{ flex: 1 }, onPressStyle]}
          title={onPressTitle}
        />
      </View>
    </BottomSheetView>
  );
};

export default BottomSheetAction;
