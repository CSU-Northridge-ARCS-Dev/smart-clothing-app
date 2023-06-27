import React from "react";
import { SafeAreaView } from "react-native";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import AppRouter from "./src/navigation";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PaperProvider>
        <NavigationContainer>
          <AppRouter />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaView>
  );
}
