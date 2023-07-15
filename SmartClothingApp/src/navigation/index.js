import React, { useEffect } from "react";
import AuthStack from "./AuthStack";
import MainTabNavigator from "./HomeStack";

import { useSelector } from "react-redux";

const AppRouter = () => {
  const uuid = useSelector((state) => state.user.uuid);

  console.log("from AuthStack --> UUID is ...", uuid);

  return uuid ? <MainTabNavigator /> : <AuthStack />;
};

export default AppRouter;
