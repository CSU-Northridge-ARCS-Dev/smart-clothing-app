import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import AppRouter from "./src/navigation";
import { useAppFonts } from "./src/hooks/useAppFonts";
import { AppTheme } from "./src/constants/themes";

export default function App() {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    const loadFont = async () => {
      const res = await useAppFonts();
      setLoading(false);
    };
    loadFont();
  }, []);

  return (
    <>
      {!isLoading && (
        <SafeAreaView style={{ flex: 1 }}>
          <PaperProvider theme={AppTheme}>
            <NavigationContainer>
              <AppRouter />
            </NavigationContainer>
          </PaperProvider>
        </SafeAreaView>
      )}
    </>
  );
}
