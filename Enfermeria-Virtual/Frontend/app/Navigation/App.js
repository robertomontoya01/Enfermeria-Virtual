import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "../(tabs)/index"; // Pantalla principal o tab navigator
import FormularioCita from "../windows/FormularioCita";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="FormularioCita" component={FormularioCita} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
