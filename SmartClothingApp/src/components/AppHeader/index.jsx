import React, { useState } from "react";
import { Platform } from "react-native";
import { Appbar, Menu } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { AppFonts } from "../../constants/themes";
import { useDispatch } from "react-redux";

import { startLogout } from "../../actions/userActions.js";

const AppHeader = (props) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const MORE_ICON = Platform.OS === "ios" ? "dots-horizontal" : "dots-vertical";
  const [visible, setVisible] = useState(false);
  const navigate = (screen) => {
    navigation.navigate(screen);
    setVisible(false);
  };
  return (
    <>
      <Appbar.Header elevated>
        {props.back && (
          <Appbar.BackAction onPress={() => navigation.goBack()} />
        )}
        <Appbar.Content
          title={props.title}
          titleStyle={{ fontFamily: AppFonts.chakraBoldItalic }}
        />
        {props.menu !== false && (
          <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            anchor={
              <Appbar.Action
                icon={MORE_ICON}
                onPress={() => setVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                navigate("Profile");
              }}
              title="Edit Profile"
            />
            <Menu.Item
              onPress={() => navigate("Settings")}
              title="Settings & Privacy"
            />
            <Menu.Item
              onPress={() => navigate("Accessibility")}
              title="Accessibility"
            />
            <Menu.Item
              onPress={() => {
                dispatch(startLogout());
              }}
              title="Logout"
            />
          </Menu>
        )}
      </Appbar.Header>
    </>
  );
};

export default AppHeader;
