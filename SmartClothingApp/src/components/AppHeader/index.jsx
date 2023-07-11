import React, { useState } from "react";
import { Platform } from "react-native";
import { Appbar, Menu } from "react-native-paper";
const AppHeader = (props) => {
  const MORE_ICON = Platform.OS === "ios" ? "dots-horizontal" : "dots-vertical";
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Appbar.Header elevated>
        {props.back && <Appbar.BackAction onPress={() => {}} />}
        <Appbar.Content title={props.title} />
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={
            <Appbar.Action icon={MORE_ICON} onPress={() => setVisible(true)} />
          }
        >
          <Menu.Item onPress={() => {}} title="Edit Profile" />
          <Menu.Item onPress={() => {}} title="Settings & Privacy" />
          <Menu.Item onPress={() => {}} title="Accessibility" />
          <Menu.Item onPress={() => {}} title="Logout" />
        </Menu>
      </Appbar.Header>
    </>
  );
};
export default AppHeader;
