// In App.js in a new project

import * as React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ForgotPasswordScreen, SigninScreen, SignupScreen } from "../screens";
import HomeScreen from "../screens/HomeScreen";
import ViewHealthData from "../screens/ViewHealthData";
import ViewInsights from "../screens/ViewInsights";
import MyDevices from "../screens/MyDevices";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SignUp" component={SignupScreen} />
      <Stack.Screen name="SignIn" component={SigninScreen} />
      <Stack.Screen name="Forgot" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
