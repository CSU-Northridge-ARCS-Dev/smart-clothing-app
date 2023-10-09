import React, { useState } from "react";
import { View, StyleSheet, Modal } from "react-native";
import { useDispatch } from "react-redux";

import { Button, HelperText, Text, TextInput } from "react-native-paper";

import { userMetricsDataModalVisible } from "../../actions/appActions";
import { startUpdateProfile } from "../../actions/userActions";

const PersonalModal = (props) => {
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();

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

  const handleUpdateProfile = () => {
    if (!isValid()) {
      return;
    }
    setIsSubmitting(true);

    dispatch(startUpdateProfile(firstName, lastName));
  };

  return (
    <View style={styles.container}>
      <Modal animationType="slide" transparent={true} visible={props.visible}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              Change first name and last name.
            </Text>

            <TextInput
              label="First Name"
              value={firstName}
              mode="outlined"
              onChangeText={(text) => {
                setFirstName(text);
                // handleClearErrors();
              }}
              error={error.fname.length > 1}
            />
            <HelperText type="error" visible={error.fname.length > 1}>
              Please enter first name.
            </HelperText>

            <TextInput
              label="Last Name"
              value={lastName}
              mode="outlined"
              onChangeText={(text) => {
                setLastName(text);
                // handleClearErrors();
              }}
              error={error.lname.length > 1}
            />
            <HelperText type="error" visible={error.lname.length > 1}>
              Please enter last name.
            </HelperText>

            <View style={styles.btnContainer}>
              <Button
                mode="outlined"
                onPress={() => {
                  if (props.visible) {
                    props.visible = false;
                  }
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
    width: "80%",
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
