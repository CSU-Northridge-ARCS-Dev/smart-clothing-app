import React, { useState } from "react";
import { View, StyleSheet, Modal } from "react-native";
import { useDispatch } from "react-redux";

import { Button, HelperText, Text, TextInput } from "react-native-paper";

import { startUpdateProfile } from "../../actions/userActions";

const PersonalModal = (props) => {
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState(props.firstName);
  const [lastName, setLastName] = useState(props.lastName);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState({
    fname: "",
    lname: "",
  });

  const isValid = () => {
    let flag = true;
    let errors = error;

    if (firstName.length < 1) {
      errors.fname = "Must have a first name.";
      flag = false;
    }

    if (lastName.length < 1) {
      errors.lname = "Must have a last name.";
      flag = false;
    }

    setError({ ...errors });
    return flag;
  };

  const handleClear = () => {
    setFirstName("");
    setLastName("");

    handleClearErrors();
    props.closeModal();
  };

  const handleClearErrors = () => {
    setError({
      fname: "",
      lname: "",
    });
    setIsSubmitting(false);
  };

  const handleUpdateProfile = () => {
    if (!isValid()) {
      return;
    }
    setIsSubmitting(true);

    dispatch(startUpdateProfile(firstName, lastName));
    props.closeModal();
  };

  return (
    <View style={styles.container}>
      <Modal animationType="slide" transparent={true} visible={props.visible}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Change first name and last name.
            </Text>
            <View>
              <TextInput
                label="First Name"
                value={firstName}
                mode="outlined"
                onChangeText={(text) => {
                  setFirstName(text);
                  handleClearErrors();
                }}
                error={error.fname.length > 1}
              />
              <HelperText type="error" visible={error.fname.length > 1}>
                Please enter first name.
              </HelperText>
            </View>

            <View>
              <TextInput
                label="Last Name"
                value={lastName}
                mode="outlined"
                onChangeText={(text) => {
                  setLastName(text);
                  handleClearErrors();
                }}
                error={error.lname.length > 1}
              />
              <HelperText type="error" visible={error.lname.length > 1}>
                Please enter last name.
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
                disabled={isSubmitting}
                mode="elevated"
                onPress={handleUpdateProfile}
                style={[
                  styles.button,
                  { backgroundColor: isSubmitting ? "#ccc" : "#007bff" },
                ]}
                textColor="white"
              >
                Save
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
    width: "85%",
    alignSelf: "center",
    elevation: 5,
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

export default PersonalModal;
