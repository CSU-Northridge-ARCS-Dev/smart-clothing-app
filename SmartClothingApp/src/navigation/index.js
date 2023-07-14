import React, { useState } from "react";
import AuthStack from "./AuthStack";
import MainTabNavigator from "./HomeStack";

// TODO: Implement Redux to manage user authentication state
const AppRouter = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); //modify useState value to simulate userAuthentication

  return isAuthenticated ? <MainTabNavigator /> : <AuthStack />;
};
export default AppRouter;
