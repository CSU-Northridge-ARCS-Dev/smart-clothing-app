import React, { useState, useEffect } from "react";
import { View, StyleSheet, Modal } from "react-native";
import { horizontalScale, verticalScale } from "../../utils/scale";
import {
  Button,
  Checkbox,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import { AppColor, AppStyle } from "../../constants/themes";

const DataCollectModal = ({
  modalVisible,
  setModalVisible,
  givenUserData,
  save,
  later,
}) => {
  const [userData, setUserData] = useState({
    gender: "",
    dob: "",
    height: "",
    weight: "",
  });

  useEffect(() => {
    if (givenUserData) {
      setUserData(givenUserData);
    }
  }, [givenUserData]);

  const [isSubmitting, setIsSubmitting] = useState(true);

  const [error, setError] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
  });
  const [checked, setChecked] = useState(false);

  const handleClear = () => {
    setUser({
      fname: "",
      lname: "",
      email: "",
      password: "",
      repassword: "",
    });

    setIsSubmitting(false);

    handleClearErrors();
  };

  const handleClearErrors = () => {
    setError({
      fname: "",
      lname: "",
      email: "",
      password: "",
    });
    setIsSubmitting(false);
  };

  // const handleSignUpWithEmail = () => {
  //   if (!isValid()) {
  //     console.log("Invalid user details!");
  //     return;
  //   }

  //   setIsSubmitting(true);
  //   dispatch(
  //     startSignupWithEmail(
  //       user.email,
  //       user.password,
  //       user.fname,
  //       user.lname,
  //       userData
  //     )
  //   );
  // };

  // const isValid = () => {
  //   let flag = true;
  //   let errors = error;
  //   if (user.email.length < 1 || !user.email.includes("@")) {
  //     errors.email = "Enter valid email!";
  //     flag = false;
  //   }
  //   if (user.password.length < 1) {
  //     errors.password = "Password cannot be empty!";
  //     flag = false;
  //   }
  //   if (user.password.length < 6) {
  //     errors.password = "Password length cannot be less than 6!";
  //     flag = false;
  //   }
  //   if (user.fname.length < 1) {
  //     errors.fname = "Firstname cannot be empty!";
  //     flag = false;
  //   }
  //   if (user.lname.length < 1) {
  //     errors.lname = "Lastname cannot be empty!";
  //     flag = false;
  //   }
  //   setError({ ...errors });
  //   return flag;
  // };

  function isMMDDYYYYFormat(value) {
    const pattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;

    return pattern.test(value);
  }
  const isDOBValid = isMMDDYYYYFormat(userData.dob);

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              Welcome. Please enter your details.
            </Text>
            <Text style={{ fontSize: 16, marginVertical: 10 }}>
              This information can be changed later in your profile tab.
            </Text>
            <TextInput
              label="Gender"
              value={userData.gender}
              mode="outlined"
              style={styles.input}
              onChangeText={(text) => {
                setUserData({ ...userData, gender: text });
                handleClearErrors();
              }}
              error={false}
            />
            <HelperText type="error" visible={false}>
              Please enter your gender.
            </HelperText>
            <TextInput
              label="Birth Date"
              placeholder="MM/DD/YYYY"
              value={userData.dob}
              mode="outlined"
              style={styles.input}
              onChangeText={(text) => {
                setUserData({ ...userData, dob: text });
                handleClearErrors();
              }}
              error={!isDOBValid}
            />
            <HelperText type="error" visible={!isDOBValid}>
              Please enter in correct format.
            </HelperText>

            <TextInput
              label="Height"
              value={userData.height}
              mode="outlined"
              style={styles.input}
              onChangeText={(text) => {
                setUserData({ ...userData, height: text });
                handleClearErrors();
              }}
              error={false}
            />
            <HelperText type="error" visible={false}>
              Please enter your height.
            </HelperText>
            <TextInput
              label="Weight"
              value={userData.weight}
              mode="outlined"
              style={styles.input}
              onChangeText={(text) => {
                setUserData({ ...userData, weight: text });
                handleClearErrors();
              }}
              error={false}
            />
            <HelperText type="error" visible={false}>
              Please enter your weight.
            </HelperText>
            <View style={styles.btnContainer}>
              <Button mode="outlined" onPress={later} style={styles.button}>
                Later
              </Button>
              <Button
                disabled={isSubmitting || !isDOBValid}
                mode="elevated"
                onPress={() => {
                  setModalVisible(!modalVisible);
                  save(userData);
                }}
                style={[
                  styles.button,
                  { backgroundColor: isSubmitting ? "#ccc" : "#007bff" },
                ]}
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

const styles = {
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
};

export default DataCollectModal;
