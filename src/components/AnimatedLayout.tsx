import React, {  ReactNode } from "react";
import { MotiView } from "moti";
import { ViewStyle } from "react-native";

const AnimatedLayout = ({ children,style }: { children: ReactNode,style:ViewStyle }) => {
  return <MotiView style={[{ flex: 1 }, style]}>{children}</MotiView>;
};

export default AnimatedLayout;
