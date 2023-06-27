import React, { useState } from "react";
import { AuthStack, MainTabNavigator } from "./AuthStack";

const AppRouter = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); //modify useState value to simulate userAuthentication

  return isAuthenticated ? <MainTabNavigator /> : <AuthStack />;
};
export default AppRouter;
