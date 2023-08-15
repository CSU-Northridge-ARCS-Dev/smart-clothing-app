import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  AccessibilityScreen,
  DeviceDetails,
  HomeScreen,
  MyDevices,
  ProfileScreen,
  SettingsScreen,
  ViewHealthData,
  ViewInsights,
} from "../screens";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialIcons";
import { AppColor, AppFonts } from "../constants/themes";
import { StyleSheet, Text } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 10,
          marginHorizontal: 10,
          borderRadius: 10,
          backgroundColor: AppColor.primaryContainer,
          elevation: 2,
          shadowColor: AppColor.secondary,
          shadowOffset: { height: 5, width: 5 },
          shadowRadius: 10,
          shadowOpacity: 0.2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigationStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <>
              <Icon
                name="home"
                size={focused ? 30 : 22}
                color={focused ? AppColor.primary : AppColor.secondary}
              />
              {focused && <Text style={styles.label}>Home</Text>}
            </>
          ),
        }}
      />
      <Tab.Screen
        name="HealthTab"
        component={HealthNavigationStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <>
              <Icon
                name="favorite"
                size={focused ? 30 : 22}
                color={focused ? AppColor.primary : AppColor.secondary}
              />
              {focused && <Text style={styles.label}>Health</Text>}
            </>
          ),
        }}
      />
      <Tab.Screen
        name="DeviceTab"
        component={DevicesNavigationStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <>
              <Icon
                name="devices-other"
                size={focused ? 30 : 22}
                color={focused ? AppColor.primary : AppColor.secondary}
              />
              {focused && <Text style={styles.label}>Devices</Text>}
            </>
          ),
        }}
      />
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
      <Stack.Screen name="Insights" component={ViewInsights} />
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
      <Stack.Screen name="DeviceDetails" component={DeviceDetails} />
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

const styles = StyleSheet.create({
  label: {
    fontFamily: AppFonts.poppinsBold,
    fontSize: 12,
    textTransform: "uppercase",
    color: AppColor.primary,
  },
});

export default MainTabNavigator;
