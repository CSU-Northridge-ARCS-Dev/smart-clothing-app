import React, { useState, useEffect } from "react";
import { AuthStack, MainTabNavigator } from "./AuthStack";

// TODO: Implement Redux to manage user authentication state
const AppRouter = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); //modify useState value to simulate userAuthentication

  return isAuthenticated ? <MainTabNavigator /> : <AuthStack />;
};
export default AppRouter;
