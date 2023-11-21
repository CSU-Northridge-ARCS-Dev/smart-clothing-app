import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as StoreProvider } from "react-redux";

import AppRouter from "./src/navigation";
import { useAppFonts } from "./src/hooks/useAppFonts";
import { AppTheme } from "./src/constants/themes";
import configureStore from "./src/store";
import { AppToast } from "./src/components";
import { auth } from "./firebaseConfig.js";
import { getUID } from "./src/utils/localStorage.js";

const store = configureStore();

export default function App() {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    console.log("from App.js: Auth.currentUser is -->", auth.currentUser);

    // Check if there's a stored token on app launch
    const checkUID = async () => {
      try {
        const storedUID = await getUID();
        console.log("Checking stored UID");
        if (storedUID) {
          // If there's a token, try to refresh the user's session
          console.log("Stored storedUID found");
        } else {
          console.log("No stored UID");
        }
      } catch (error) {
        console.error("Error checking stored UID:", error);
      }
    };
    checkUID();

    // Loading fonts
    const loadFont = async () => {
      const res = await useAppFonts();
      setLoading(false);
    };
    loadFont();

    console.log("from App.js: Auth.currentUser is -->", auth.currentUser);

    // // Check if there's a stored token on app launch
    // const checkToken = async () => {
    //   try {
    //     const storedToken = await AsyncStorage.getItem("userToken");
    //     if (storedToken) {
    //       // If there's a token, try to refresh the user's session
    //       const credential = auth.GoogleAuthProvider.credential(storedToken);
    //       const refreshedUser = await auth().signInWithCredential(credential);
    //       setUser(refreshedUser);
    //     }
    //   } catch (error) {
    //     console.error("Error checking token:", error);
    //   }
    // };

    // checkToken();

    // Listen for changes in authentication state
    // const unsubscribe = auth().onAuthStateChanged((newUser) => {
    //   if (newUser) {
    //     setUser(newUser);
    //   } else {
    //     setUser(null);
    //   }
    // });

    // return () => unsubscribe();
  }, []);

  return (
    <>
      {!isLoading && (
        <SafeAreaView style={{ flex: 1 }}>
          <StoreProvider store={store}>
            <PaperProvider theme={AppTheme}>
              <NavigationContainer>
                <AppRouter />
              </NavigationContainer>
              <AppToast />
            </PaperProvider>
          </StoreProvider>
        </SafeAreaView>
      )}
    </>
  );
}
