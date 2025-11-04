import React, { ReactNode } from "react";
import { Text, TextInput } from "react-native";

type FontProviderProps = {
  children: ReactNode;
};

export default function FontProvider({ children }: FontProviderProps) {
  const defaultFontFamily = { fontFamily: "Montserrat_400Regular" };

  const CustomText = (props: any) => (
    <Text {...props} style={[defaultFontFamily, props.style]}>
      {props.children}
    </Text>
  );

  const CustomTextInput = (props: any) => (
    <TextInput {...props} style={[defaultFontFamily, props.style]} />
  );

  // @ts-ignore - React Native no tipa global.Text
  global.Text = CustomText;
  // @ts-ignore
  global.TextInput = CustomTextInput;

  return <>{children}</>;
}
