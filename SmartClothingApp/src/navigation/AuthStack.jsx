// In App.js in a new project

import * as React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ForgotPasswordScreen, SigninScreen, SignupScreen} from "../screens";
import HomeScreen from "../screens/HomeScreen";
import ViewHealthData from "../screens/ViewHealthData";
import ViewInsights from "../screens/ViewInsights";
import MyDevices from "../screens/MyDevices";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export function AuthStack() {
  return (
      <Stack.Navigator initialRouteName="Signup">
        <Stack.Screen name="SignUp" component={SignupScreen} />
        <Stack.Screen name="SignIn" component={SigninScreen} />
        <Stack.Screen name="Forgot" component={ForgotPasswordScreen} />
      </Stack.Navigator>
      
  );
}

export function MainTabNavigator() {
  return (
      <Tab.Navigator initialRouteName="Home">
        <Tab.Screen name="Home Screen" component={HomeScreen} />
        <Tab.Screen name="View Health Data" component={ViewHealthData} />
        <Tab.Screen name="View Insights" component={ViewInsights} />
        <Tab.Screen name="My Devices" component={MyDevices} />
      </Tab.Navigator>
  );
}

