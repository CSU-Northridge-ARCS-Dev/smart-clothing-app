import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet, StatusBar } from "react-native";
import { AppHeader } from "../../components";
import { AppFonts, AppColor, AppStyle } from "../../constants/themes";
import { useDispatch } from "react-redux";

import UpdateEmailModal from "../../components/UpdateEmailModal/UpdateEmailModal";
import DeleteAccountModal from "../../components/DeleteAccountModal/DeleteAccountModal";
import ChangePasswordModal from "../../components/ChangePasswordModal/ChangePasswordModal"
import ToSModal from "../../components/ToSModal/ToSModal";
import SettingsButton from "../../components/UI/SettingsButton";
import PermissionsModal from "../../components/PermissionsModal/PermissionsModal";


const SettingsScreen = ({ navigation, route }) => {
  const { previousScreenTitle } = route.params;
  const [isModalVisible, setModalVisible] = useState({
    modal1: false,
    modal2: false,
    modal3: false,
    modal4: false,
    changePasswordModal: false,
    modalPermissions: false,
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
    <ScrollView>
      <AppHeader title={previousScreenTitle} back={true} menu={false} />
      <UpdateEmailModal
        visible={isModalVisible.modal1}
        closeModal={() => closeModal("modal1")}
      ></UpdateEmailModal>
      <DeleteAccountModal
        visible={isModalVisible.modal4}
        closeModal={() => closeModal("modal4")}
      ></DeleteAccountModal>
      <PermissionsModal
        visible={isModalVisible.modalPermissions}
        closeModal={() => closeModal("modalPermissions")}
      ></PermissionsModal>

      <ChangePasswordModal
        visible={isModalVisible.changePasswordModal}
        closeModal={() => closeModal("changePasswordModal")} 
      ></ChangePasswordModal>

      <ToSModal
        visible={isModalVisible.modal2}
        closeModal={() => closeModal("modal2")}
      ></ToSModal>

      <View>
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
      <View style={styles.content}>
        <SettingsButton
          title="UPDATE EMAIL"
          onPress={() => openModal("modal1")}
          description="Change your account email"
        />
        <SettingsButton
          title="CHANGE PASSWORD"
          onPress={() => openModal("changePasswordModal")}
          description="Change your account password"
        />
        <SettingsButton
          title="MANAGE PERMISSIONS"
          onPress={() => openModal("modalPermissions")}
          description="Manage data sharing and permissions"
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
        <SettingsButton
          title="TERMS OF SERVICES"
          onPress={() => openModal("modal2")}
          description="Review terms of services"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    marginVertical: 24,
    textAlign: "center",
  },
  content: {
    alignItems: "center",
    gap: 30, 
    marginBottom: 24,
  },
  selectBtn: {
    borderRadius: 10,
    width: "85%",
    height: 90,
    alignItems: "flex-start",
    padding: 15,
    backgroundColor: AppColor.lightColor,
    elevation: 4,
  },
  btnText: {
    fontSize: 21,
  },
  adnText: {
    fontSize: 14,
    color: AppColor.secondary,
    paddingTop: 5,
  },
});

export default SettingsScreen;
