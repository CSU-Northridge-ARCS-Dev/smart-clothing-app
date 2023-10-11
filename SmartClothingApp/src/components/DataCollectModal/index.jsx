import React, { useState, useEffect } from "react";
import { View, StyleSheet, Modal, SafeAreaView } from "react-native";
import { useSelector, useDispatch } from "react-redux";

import {
  Button,
  Checkbox,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";

import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

import { AppColor, AppStyle } from "../../constants/themes";
import { Gender, Sports } from "../../utils/metrics";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { userMetricsDataModalVisible } from "../../actions/appActions";
import { startUpdateUserData } from "../../actions/userActions";
import MyDropdown from "../UI/dropdown";

const DataCollectModal = (props) => {
  const dispatch = useDispatch();
  const visible = useSelector((state) => state.app.userMetricsDataModalVisible);
  const isFromSignupScreen = useSelector(
    (state) => state.app.isFromSignUpScreen
  );

  /*
    userData: {
    gender: "",
    dob: "",
    height: "",
    weight: "",
  }
  */

  const [gender, setGender] = useState("");
  const [date, setDate] = useState(new Date());
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [sports, setSports] = useState("");
  const [age, setAge] = useState("");

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    DateTimePickerAndroid.open({
      value: date,
      onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const showDatePicker = () => {
    showMode("date");
  };

  const showTimePicker = () => {
    showMode("time");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
  });

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
    });
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (date) {
      const age = new Date().getFullYear() - new Date(date).getFullYear();
      console.log(date);
      console.log("calculated age = ", age);
      setAge(age);
    }
  }, [date]);

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

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          dispatch(userMetricsDataModalVisible(false, false));
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              Please enter your details.
            </Text>

            {isFromSignupScreen && (
              <Text style={{ fontSize: 16, marginVertical: 10 }}>
                This information can be changed later in your profile tab.
              </Text>
            )}

            <MyDropdown
              data={Object.entries(Gender).map(([key, value]) => ({
                label: key,
                value: value,
              }))}
              value={gender}
              placeholder={"Gender"}
              onChange={(item) => {
                setGender(item.value);
              }}
            />

            <MyDropdown
              data={Object.entries(Sports).map(([key, value]) => ({
                label: key,
                value: value,
              }))}
              value={sports}
              placeholder={"Sports"}
              onChange={(item) => {
                setSports(item.value);
              }}
            />

            <View
              style={{
                flexDirection: "row",
                // justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {/* <Text>Gender</Text>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue, itemIndex) => setGender(itemValue)}
                mode={"dropdown"}
                style={{
                  // flex: 1,
                  width: 150,
                }}
              >
                {Object.entries(Gender).map(([key, value]) => (
                  <Picker.Item key={key} label={key} value={value} />
                ))}
              </Picker> */}
            </View>
            {/* <HelperText type="error" visible={false}>
              Please enter your gender.
            </HelperText> */}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderColor: "gray",
                borderWidth: 1,
                backgroundColor: "white",
                fontFamily: "sans-serif",
                height: 51,
                marginBottom: 12,
              }}
            >
              <Text style={{ marginLeft: 14, fontSize: 17 }}>
                Date of Birth
              </Text>
              <SafeAreaView>
                <Button onPress={showDatePicker}>
                  {date.toLocaleDateString()}
                </Button>
              </SafeAreaView>
            </View>
            {/* <HelperText type="error" visible={false}>
              Please enter Birth Date!
            </HelperText> */}

            <TextInput
              label="Height"
              value={height}
              mode="outlined"
              keyboardType="numeric"
              inputMode="numeric"
              style={styles.input}
              onChangeText={(text) => {
                setHeight(text);
                // handleClearErrors();
              }}
              error={false}
            />
            {/* <HelperText type="error" visible={false}>
              Please enter your height.
            </HelperText> */}
            <TextInput
              label="Weight"
              value={weight}
              mode="outlined"
              keyboardType="numeric"
              inputMode="numeric"
              style={styles.input}
              onChangeText={(text) => {
                setWeight(text);
                handleClearErrors();
              }}
              error={false}
            />
            {/* <HelperText type="error" visible={false}>
              Please enter your weight.
            </HelperText> */}
            <View style={styles.btnContainer}>
              <Button
                mode="outlined"
                onPress={() =>
                  dispatch(userMetricsDataModalVisible(false, false))
                }
                style={styles.button}
              >
                {isFromSignupScreen ? "Skip" : "Cancel"}
              </Button>
              <Button
                disabled={isSubmitting}
                mode="elevated"
                onPress={() => {
                  dispatch(
                    startUpdateUserData({
                      gender,
                      age,
                      height,
                      weight,
                      sports,
                    })
                  );
                  dispatch(userMetricsDataModalVisible(false, false));
                }}
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

export default DataCollectModal;
