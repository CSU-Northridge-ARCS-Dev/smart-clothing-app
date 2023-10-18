import React, { useState } from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { AppHeader } from "../../components";
import { AppFonts, AppColor, AppStyle } from "../../constants/themes";
import { useDispatch } from "react-redux";

import { updateUserEmail } from "../../actions/userActions";
import UpdateEmailModal from "../../components/UpdateEmailModal/UpdateEmailModal";
import DeleteAccountModal from "../../components/DeleteAccountModal/DeleteAccountModal";

import SettingsButton from "../../components/UI/SettingsButton";

const SettingsScreen = ({ navigation, route }) => {
  const { previousScreenTitle } = route.params;
  const [isModalVisible, setModalVisible] = useState({
    modal1: false,
    modal2: false,
    modal3: false,
    modal4: false,
  });
  const dispatch = useDispatch();

  const openModal = (modal) => {
    setModalVisible({ ...isModalVisible, [modal]: true });
    StatusBar.setBarStyle("dark-content");
  };

  const closeModal = (modal) => {
    setModalVisible({ ...isModalVisible, [modal]: false });
    StatusBar.setBarStyle("light-content");
  };

  return (
    <View style>
      <AppHeader title={previousScreenTitle} back={true} menu={false} />
      <UpdateEmailModal
        visible={isModalVisible.modal1}
        closeModal={() => closeModal("modal1")}
      ></UpdateEmailModal>
      <DeleteAccountModal
        visible={isModalVisible.modal4}
        closeModal={() => closeModal("modal4")}
      ></DeleteAccountModal>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            AppStyle.textPrimary,
            { fontFamily: AppFonts.chakraBold },
          ]}
        >
          {"Account\nSettings"}
        </Text>
      </View>
      <View style={{ alignItems: "center", gap: 30 }}>
        <SettingsButton
          title="UPDATE EMAIL"
          onPress={() => openModal("modal1")}
          description="Change your account email"
        />
        <SettingsButton
          title="CHANGE PASSWORD"
          description="Change your account password"
        />
        <SettingsButton
          title="DELETE DATA"
          description="Permanently delete all stored data"
        />
        <SettingsButton
          title="DELETE ACCOUNT"
          onPress={() => openModal("modal4")}
          description="Permanently delete your account"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    marginVertical: 24,
    textAlign: "center",
  },
  selectBtn: {
    borderRadius: 10,
    width: "85%",
    height: 90,
    alignItems: "flex-start",
    padding: 15,
    backgroundColor: "#EAF0F8",
    elevation: 4,
  },
  btnText: {
    fontSize: 21,
  },
  adnText: {
    fontSize: 14,
    color: "#7D7A7A",
    paddingTop: 5,
  },
});

export default SettingsScreen;
