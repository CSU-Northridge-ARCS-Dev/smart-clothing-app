import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  AccessibilityScreen,
  HomeScreen,
  MyDevices,
  ProfileScreen,
  SettingsScreen,
  ViewHealthData,
  ViewInsights,
} from "../screens";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeStack"
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeNavigationStack} />
      <Tab.Screen name="Health" component={HealthNavigationStack} />
      <Tab.Screen name="Insight" component={InsightsNavigationStack} />
      <Tab.Screen name="Device" component={DevicesNavigationStack} />
    </Tab.Navigator>
  );
};

const HomeNavigationStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
    </Stack.Navigator>
  );
};

const DevicesNavigationStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Devices"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Devices" component={MyDevices} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
    </Stack.Navigator>
  );
};

const HealthNavigationStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Health"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Health" component={ViewHealthData} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
    </Stack.Navigator>
  );
};

const InsightsNavigationStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Insights"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Insights" component={ViewInsights} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
    </Stack.Navigator>
  );
};

export default MainTabNavigator;
