import React, { useEffect } from "react";
import AuthStack from "./AuthStack";
import MainTabNavigator from "./HomeStack";

import { useDispatch, useSelector } from "react-redux";
import { toastInfo } from "../actions/toastActions";

const AppRouter = () => {
  const uuid = useSelector((state) => state.user.uuid);
  const dispatch = useDispatch();
  console.log("from AuthStack --> UUID is ...", uuid);
  useEffect(() => {
    dispatch(toastInfo("from AuthStack --> UUID is ... " + uuid));
  }, []);
  console.log(uuid);
  return uuid ? <MainTabNavigator /> : <AuthStack />;
  // return true ? <MainTabNavigator /> : <AuthStack />;
};

export default AppRouter;
