import React, { useState } from "react";
import { View, StyleSheet, Modal, KeyboardAvoidingView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { updateUserEmail, reauthenticate } from "../../actions/userActions";

import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { AppColor, AppFonts } from "../../constants/themes";
import { toastInfo } from "../../actions/toastActions";
import AppToast from "../Dialogs/AppToast";
import { deleteAccount } from "../../actions/userActions";

const DeleteAccountModal = (props) => {
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState();

  const isValid = () => {
    let flag = true;
    let errors = error;

    if (password.length < 1) {
      errors.password = "Password cannot be empty.";
      flag = false;
    }

    setError({ ...errors });
    return flag;
  };

  const handleClearErrors = () => {
    setError({
      password: "",
    });
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!isValid()) {
      return;
    }

    setIsSubmitting(true);
    const reAuthResult = await dispatch(reauthenticate(password));

    if (reAuthResult) {
      dispatch(deleteAccount());
      setPassword("");
    }
  };

  return (
    <>
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
            <KeyboardAvoidingView
              behavior="padding"
              keyboardVerticalOffset={90}
              gap={30}
            >
              <Text style={styles.title}>Account Deletion</Text>
              <View>
                <Text style={styles.textContainer}>
                  Are you sure you want to delete your account? Once you delete
                  your account, you cannot recover it.
                </Text>
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
                  error={error.password.length > 1}
                />
                <HelperText type="error" visible={error.password.length > 1}>
                  {error.password}
                </HelperText>
              </View>
              <View style={styles.btnContainer}>
                <Button
                  disabled={isSubmitting}
                  mode="outlined"
                  textColor="#fff"
                  onPress={() => {
                    handleDelete(password);
                  }}
                  style={[styles.button, { backgroundColor: AppColor.primary }]}
                >
                  Yes
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    props.closeModal();
                  }}
                  style={styles.button}
                >
                  No
                </Button>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    textAlign: "center",
    color: AppColor.primary,
    fontFamily: AppFonts.chakraBold,
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
    backgroundColor: AppColor.secondaryContainer,
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
  textContainer: {
    backgroundColor: AppColor.primary,
    padding: 10,
    color: "white",
    fontSize: 17,
    elevation: 5,
    textAlign: "center",
  },
});

export default DeleteAccountModal;
