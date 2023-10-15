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
import { Gender, Sports, Height } from "../../utils/metrics";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { userMetricsDataModalVisible } from "../../actions/appActions";
import { startUpdateUserData } from "../../actions/userActions";
import MyDropdown from "../UI/dropdown";

const DataCollectModal = ({ isFromSignupScreen = false }) => {
  const dispatch = useDispatch();
  const visible = useSelector((state) => state.app.userMetricsDataModalVisible);
  const [selectedHeight, setSelectedHeight] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");

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
    const selectedDate = date.set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    DateTimePickerAndroid.open({
      value: selectedDate,
      onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const showDatePicker = () => {
    showMode("date");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState({
    height: "",
    weight: "",
    feet: "",
    inches: "",
  });

  const isValid = () => {
    let flag = true;
    let errors = error;

    integerRegex = /^\d*$/;
    numberRegex = /^[0-9.]*$/;

    if (feet.length > 1) {
      errors.feet = "Enter a single integer.";
      flag = false;
    }
    if ((inches < 0 || inches > 11) && feet !== "") {
      errors.inches = "Enter between 0-11.";
      flag = false;
    }
    if (!integerRegex.test(feet)) {
      errors.feet = "Only numbers allowed.";
      flag = false;
    }
    if (!integerRegex.test(inches)) {
      errors.inches = "Only numbers allowed.";
      flag = false;
    }
    if (!numberRegex.test(weight)) {
      errors.weight = "Only numbers allowed.";
      flag = false;
    }
    if (!integerRegex.test(height)) {
      errors.height = "Only numbers allowed.";
      flag = false;
    }
    setError({ ...errors });
    return flag;
  };

  const handleClearErrors = () => {
    setError({
      height: "",
      weight: "",
      feet: "",
      inches: "",
    });
    setIsSubmitting(false);
  };

  const kilogramsToPounds = (kilograms) => {
    return kilograms * 2.20462;
  };

  const handleSubmit = () => {
    if (!isValid()) {
      return;
    }

    dispatch(
      startUpdateUserData({
        gender,
        age,
        height,
        weight,
        sports,
      })
    );
    dispatch(userMetricsDataModalVisible(false));
  };

  useEffect(() => {
    if (date) {
      const age = new Date().getFullYear() - new Date(date).getFullYear();
      console.log(date);
      console.log("calculated age = ", age);
      setAge(age);
    }
  }, [date]);

  useEffect(() => {
    if (selectedHeight === "ft") {
      const feetValue = parseInt(feet) || 0;
      const inchesValue = parseInt(inches) || 0;
      const totalInches = feetValue * 12 + inchesValue;
      setHeight(totalInches);
    }
  }, [selectedHeight, feet, inches]);

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          dispatch(userMetricsDataModalVisible(false));
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
            ></View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderColor: "gray",
                borderWidth: 1,
                backgroundColor: "white",
                fontFamily: "sans-serif",
                height: 50,
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

            <View
              style={[
                styles.input,
                {
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 10,
                },
              ]}
            >
              {selectedHeight !== "ft" && (
                <TextInput
                  label="Height"
                  value={height}
                  mode="outlined"
                  keyboardType="numeric"
                  inputMode="numeric"
                  style={{ flex: 1 }}
                  onChangeText={(item) => {
                    setHeight(item);
                    handleClearErrors();
                  }}
                  error={error.height.length > 1}
                />
              )}
              {selectedHeight === "ft" && (
                <>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label="feet"
                      value={feet}
                      mode="outlined"
                      keyboardType="numeric"
                      inputMode="numeric"
                      onChangeText={(item) => {
                        setFeet(item);
                        handleClearErrors();
                      }}
                      error={error.feet.length > 1}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label="inches"
                      value={inches}
                      mode="outlined"
                      keyboardType="numeric"
                      inputMode="numeric"
                      onChangeText={(item) => {
                        setInches(item);
                        handleClearErrors();
                      }}
                      error={error.inches.length > 1}
                    />
                  </View>
                </>
              )}
              <MyDropdown
                data={[
                  { label: "CM", value: "cm" },
                  { label: "FT", value: "ft" },
                ]}
                value={selectedHeight}
                style={{ width: 80, marginBottom: 0 }}
                placeholder={"unit"}
                onChange={(item) => {
                  setSelectedHeight(item.value);
                }}
              />
            </View>
            {error.feet.length > 1 && !(error.inches.length > 1) && (
              <HelperText type="error" visible={error.feet.length > 1}>
                {error.feet}
              </HelperText>
            )}
            {error.inches.length > 1 && !(error.feet.length > 1) && (
              <HelperText type="error" visible={error.inches.length > 1}>
                {error.inches}
              </HelperText>
            )}
            {error.feet.length > 1 && error.inches.length > 1 && (
              <HelperText
                type="error"
                visible={error.feet.length > 1 && error.inches.length > 1}
              >
                Both inputs are invalid.
              </HelperText>
            )}
            <View
              style={[
                styles.input,
                {
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 10,
                },
              ]}
            >
              <TextInput
                label="Weight"
                value={weight}
                mode="outlined"
                keyboardType="numeric"
                inputMode="numeric"
                style={{ flex: 1 }}
                onChangeText={(item) => {
                  if (selectedWeight === "kg" && isValid()) {
                    item = kilogramsToPounds(item);
                  }
                  setWeight(item);
                  handleClearErrors();
                }}
                error={error.weight.length > 1}
              />
              <MyDropdown
                data={[
                  { label: "LB", value: "lbs" },
                  { label: "KG", value: "kg" },
                ]}
                value={selectedWeight}
                style={{ width: 80, marginBottom: 0 }}
                placeholder={"unit"}
                onChange={(item) => {
                  setSelectedWeight(item.value);
                }}
              />
            </View>
            {error.weight.length > 1 && (
              <HelperText type="error" visible={error.weight.length > 1}>
                {error.weight}
              </HelperText>
            )}
            <View style={styles.btnContainer}>
              <Button
                mode="outlined"
                onPress={() => dispatch(userMetricsDataModalVisible(false))}
                style={styles.button}
              >
                {isFromSignupScreen ? "Skip" : "Cancel"}
              </Button>
              <Button
                disabled={isSubmitting}
                mode="elevated"
                onPress={() => {
                  handleSubmit();
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
