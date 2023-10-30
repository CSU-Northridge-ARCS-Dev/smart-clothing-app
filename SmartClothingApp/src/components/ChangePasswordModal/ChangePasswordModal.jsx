import React, { useState } from "react";
import { View, StyleSheet, Modal, KeyboardAvoidingView } from "react-native";
import { Button, Text, TextInput, HelperText } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome5";
import { AppColor, AppFonts } from "../../constants/themes";
import AppToast from "../Dialogs/AppToast";
import { reauthenticate, updateUserPassword } from "../../actions/userActions";
import { useDispatch, useSelector } from "react-redux";
import { toastInfo, toastError } from "../../actions/toastActions";

const ChangePasswordModal = (props) => {
  const dispatch = useDispatch();
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState({
    current: "",
    new: "",
  });

  const handleCancel = () => {
    resetForm();
    setPasswordVisible(false);
    props.closeModal();
  };

  const handleClearErrors = () => {
    setError({
      current: "",
      new: "",
    });
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    handleClearErrors();
  };

  const isValid = () => {
    let flag = true;
    let errors = error;

    if (newPassword === "") {
      errors.new = "New password cannot be empty.";
      flag = false;
    }

    if (newPassword.length < 6) {
      errors.new = "Password length must be at least 6 characters.";
      flag = false;
    }

    if (newPassword === currentPassword) {
      errors.new = "New password cannot be the same as the current password.";
      errors.current =
        "New password cannot be the same as the current password.";
      flag = false;
    }

    setError({ ...errors });
    return flag;
  };

  const handleUpdate = async () => {
    if (!isValid()) {
      return;
    }
    setIsSubmitting(true);
    console.log(currentPassword);
    const reauthSuccessful = await dispatch(reauthenticate(currentPassword));

    if (reauthSuccessful) {
      resetForm();
      setPasswordVisible(false);
      dispatch(updateUserPassword(newPassword));
      dispatch(toastInfo("Password update success"));
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={props.visible}
      presentationStyle="pageSheet"
      statusBarTranslucent={true}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.toastContainer}
          >
            <AppToast />
          </KeyboardAvoidingView>
          <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={80}>
            <Text style={styles.title}>Password Change</Text>

            <View style={styles.inputContainer}>
              <TextInput
                label="Current Password"
                value={currentPassword}
                mode="outlined"
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  handleClearErrors();
                }}
                secureTextEntry={!isPasswordVisible}
                error={error.current.length > 1}
              />
              <Icon
                name={isPasswordVisible ? "unlock-alt" : "lock"}
                size={25}
                color="black"
                style={styles.icon}
                onPress={() => setPasswordVisible(!isPasswordVisible)}
              />
            </View>
            <HelperText type="error" visible={error.current.length > 1}>
              {error.current}
            </HelperText>
            <View style={styles.inputContainer}>
              <TextInput
                label="New Password"
                value={newPassword}
                mode="outlined"
                onChangeText={(text) => {
                  setNewPassword(text);
                  handleClearErrors();
                }}
                secureTextEntry={!isPasswordVisible}
                error={error.new.length > 1 || newPassword !== confirmPassword}
              />
            </View>
            <HelperText type="error" visible={error.new.length > 1}>
              {error.new}
            </HelperText>
            <View style={styles.inputContainer}>
              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                mode="outlined"
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  handleClearErrors();
                }}
                secureTextEntry={!isPasswordVisible}
                error={newPassword != confirmPassword}
              />
              <HelperText type="error" visible={newPassword != confirmPassword}>
                Passwords do not match.
              </HelperText>
            </View>

            <View style={styles.btnContainer}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                mode="outlined"
                textColor="white"
                onPress={handleUpdate}
                style={[styles.button, { backgroundColor: AppColor.primary }]}
              >
                Update
              </Button>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    marginVertical: 24,
    textAlign: "center",
    paddingBottom: 10,
    color: AppColor.primary,
    fontFamily: AppFonts.chakraBold,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: AppColor.primaryContainer,
    padding: 20,
    borderRadius: 10,
    width: "100%",
    height: "100%",
    alignSelf: "center",
    elevation: 5,
    justifyContent: "center",
  },
  btnContainer: {
    marginVertical: 10,
    flexDirection: "row",
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#fff",
  },
  toastContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  inputContainer: {
    position: "relative",
  },
  textInput: {
    marginBottom: 10,
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 16,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
});

export default ChangePasswordModal;
