import React, { useState } from "react";
import { View, StyleSheet, Modal, KeyboardAvoidingView } from "react-native";
import { useDispatch } from "react-redux";
import { updateUserEmail } from "../../actions/userActions";

import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { AppColor } from "../../constants/themes";
import { toastInfo } from "../../actions/toastActions";
import AppToast from "../Dialogs/AppToast";
import PromptModal from "../Dialogs/PromptModal";
import { reauthenticate } from "../../actions/userActions";
import { auth } from "../../../firebaseConfig";

const SettingModal = (props) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPrompt, setPrompt] = useState(false);
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState({
    email: "",
    confirm: "",
  });

  const isValid = () => {
    let flag = true;
    let errors = error;

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(email)) {
      errors.email = "Enter valid email.";
      flag = false;
    }
    if (confirm !== email) {
      errors.confirm = "Emails do not match.";
      flag = false;
    }

    setError({ ...errors });
    return flag;
  };

  const handleClearErrors = () => {
    setError({
      email: "",
      confirm: "",
    });

    setIsSubmitting(false);
  };

  const onPressLogout = (res) => {
    setPrompt(false);
  };

  const handleClear = () => {
    setEmail("");
    setConfirm("");
  };

  const handleUpdateEmail = async (newEmail) => {
    if (!isValid()) {
      return;
    }

    setPrompt(true);

    await dispatch(reauthenticate(password));
    setIsSubmitting(true);

    await dispatch(updateUserEmail(newEmail));
    dispatch(toastInfo("Email updated successfully."));
    handleClear();
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
          {/* <Modal visible={showPrompt} style={styles.modalContainer}>
            <PromptModal
              style={{ zIndex: 9999 }}
              title="Reauthentication"
              message="Please provide your password"
              visible={showPrompt}
              prompt={onPressLogout}
            />
          </Modal> */}
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.toastContainer}
          >
            <AppToast />
          </KeyboardAvoidingView>
          <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={50}>
            <Text style={styles.title}>Update Email</Text>
            <View>
              <TextInput
                label="New Email"
                value={email}
                mode="outlined"
                onChangeText={(text) => {
                  setEmail(text);
                  handleClearErrors();
                }}
                error={error.email.length > 1 || error.confirm.length > 1}
              />
              <HelperText type="error" visible={error.email.length > 1}>
                {error.email}
              </HelperText>
            </View>
            <View>
              <TextInput
                label="Confirm Email"
                value={confirm}
                mode="outlined"
                onChangeText={(text) => {
                  setConfirm(text);
                  handleClearErrors();
                }}
                error={error.confirm.length > 1}
              />
              <HelperText type="error" visible={error.confirm.length > 1}>
                {error.confirm}
              </HelperText>
            </View>
            <View>
              <TextInput
                label="Password"
                secureTextEntry
                value={password}
                mode="outlined"
                onChangeText={(text) => {
                  setPassword(text);
                  handleClearErrors();
                }}
                error={false}
              />
              {/* <HelperText type="error" visible={error.password.length > 1}>
                {error.password}
              </HelperText> */}
            </View>
            <View style={styles.btnContainer}>
              <Button
                mode="outlined"
                onPress={() => {
                  props.closeModal();
                }}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                mode="outlined"
                onPress={() => {
                  handleUpdateEmail(email);
                }}
                style={styles.button}
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
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Translucent black ovelay
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
  input: {
    marginVertical: 10,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#fff",
  },
  calendar: {
    borderColor: "gray",
    borderWidth: 1,
    backgroundColor: "white",
    fontFamily: "sans-serif",
  },
  toastContainer: {
    position: "absolute",
    bottom: 20, // Adjust the positioning as needed
    left: 0,
    right: 0,
    zIndex: 999, // Ensure the toast appears over the modal
  },
  modalContainer: {
    backgroundColor: AppColor.primaryContainer,
    padding: 20,
    borderRadius: 10,
    width: "50%",
    height: "50%",
    alignSelf: "center",
    elevation: 5,
    justifyContent: "center",
  },
});

export default SettingModal;
