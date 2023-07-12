import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  HomeScreen,
  MyDevices,
  ViewHealthData,
  ViewInsights,
} from "../screens";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Health" component={ViewHealthData} />
      <Tab.Screen name="Insights" component={ViewInsights} />
      <Tab.Screen name="Devices" component={MyDevices} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
