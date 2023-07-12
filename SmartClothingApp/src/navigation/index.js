import React, { useState } from "react";
import AuthStack from "./AuthStack";
import MainTabNavigator from "./HomeStack";

const AppRouter = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); //modify useState value to simulate userAuthentication

  return isAuthenticated ? <MainTabNavigator /> : <AuthStack />;
};
export default AppRouter;
