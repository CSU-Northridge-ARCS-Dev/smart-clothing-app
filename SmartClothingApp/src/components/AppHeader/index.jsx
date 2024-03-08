import React, { useState } from "react";
import { Platform } from "react-native";
import { Appbar, Menu } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppFonts } from "../../constants/themes";
import { useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/FontAwesome5";
import { startLogout } from "../../actions/userActions.js";
import PromptModal from "../Dialogs/PromptModal";

const AppHeader = (props) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const MORE_ICON = Platform.OS === "ios" ? "dots-horizontal" : "dots-vertical";
  const [visible, setVisible] = useState(false);
  const [showPrompt, setPrompt] = useState(false);

  const navigate = (screen) => {
    navigation.navigate(screen, {
      previousScreenTitle: route.name,
    });

    setVisible(false);
  };
  const onPressLogout = (res) => {
    if (res) {
      dispatch(startLogout());
    } else {
      setPrompt(false);
    }
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
              onPress={() => navigate("Profile")}
              leadingIcon={() => <Icon name="user" size={18} color="black" />}
              title="Edit Profile"
            />
            <Menu.Item
              onPress={() => navigate("Settings")}
              leadingIcon={() => <Icon name="cog" size={18} color="black" />}
              title="Settings & Privacy"
            />
            <Menu.Item
              onPress={() => navigate("Accessibility")}
              leadingIcon={() => (
                <Icon name="universal-access" size={18} color="black" />
              )}
              title="Accessibility"
            />
            <Menu.Item
              onPress={() => {
                setPrompt(true);
                setVisible(false);
              }}
              leadingIcon={() => (
                <Icon
                  name="sign-out-alt"
                  size={18}
                  style={{ width: 18 }}
                  color="black"
                />
              )}
              title="Logout"
            />
          </Menu>
        )}
      </Appbar.Header>
      <PromptModal
        title="Logout"
        message="Do you really want to Logout?"
        visible={showPrompt}
        prompt={onPressLogout}
      />
    </>
  );
};

export default AppHeader;
