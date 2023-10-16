import React, { useState } from "react";
import { View, StyleSheet, Modal } from "react-native";
import { useDispatch } from "react-redux";
import { updateUserEmail } from "../../actions/userActions";

import { Button, HelperText, Text, TextInput } from "react-native-paper";

const SettingModal = (props) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");

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
  };

  const handleUpdateEmail = (newEmail) => {
    if (!isValid()) {
      return;
    }

    dispatch(updateUserEmail(newEmail));
    props.closeModal();
  };

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={props.visible}
        presentationStyle="overFullScreen"
        statusBarTranslucent={true}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
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
                error={error.email.length > 1}
              />
              <HelperText type="error" visible={error.email.length > 1}>
                {error.email}
              </HelperText>
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
                mode="outlined"
                onPress={() => {
                  handleUpdateEmail(email);
                }}
                style={styles.button}
              >
                Update
              </Button>
            </View>
          </View>
          <View></View>
        </View>
      </Modal>
    </View>
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
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Translucent black ovelay
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
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
  },
  calendar: {
    borderColor: "gray",
    borderWidth: 1,
    backgroundColor: "white",
    fontFamily: "sans-serif",
  },
});

export default SettingModal;
