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

const DataCollectModal = (props) => {
  const dispatch = useDispatch();
  const visible = useSelector((state) => state.app.userMetricsDataModalVisible);
  const currentUserMetricsData = useSelector(
    (state) => state.user.userMetricsData
  );
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

  const [selectedHeight, setSelectedHeight] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [cent, setCent] = useState("");
  const [kilograms, setKilograms] = useState("");

  const [gender, setGender] = useState("");
  const [dob, setDob] = useState(new Date());
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [sports, setSports] = useState("");

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setDob(currentDate);
  };

  const showMode = (currentMode) => {
    dob.setHours(0, 0, 0, 0);
    DateTimePickerAndroid.open({
      value: dob,
      onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const showDatePicker = () => {
    showMode("dob");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState({
    height: "",
    weight: "",
    feet: "",
    inches: "",
    cent: "",
    selectHeight: "",
    selectWeight: "",
  });

  const handleClearErrors = () => {
    setError({
      height: "",
      weight: "",
      feet: "",
      inches: "",
      cent: "",
      selectHeight: "",
      selectWeight: "",
    });
    setIsSubmitting(false);
  };

  const isValid = () => {
    let flag = true;
    let errors = error;

    const integerRegex = /^\d*$/;
    const numberRegex = /^[0-9.]*$/;

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
    if (!integerRegex.test(cent)) {
      errors.cent = "Only numbers allowed.";
      flag = false;
    }
    if (selectedHeight === "") {
      errors.selectHeight = "Select a unit.";
      flag = false;
    }
    if (selectedWeight === "") {
      errors.selectWeight = "Select a unit.";
      flag = false;
    }
    setError({ ...errors });
    return flag;
  };

  const kilogramsToPounds = (value) => {
    var pounds = value * 2.20462;
    return pounds;
  };

  const poundsToKilograms = (value) => {
    var kilograms = value / 2.20462;
    return kilograms;
  };

  const handleSubmit = () => {
    if (!isValid()) {
      return;
    }

    dispatch(
      startUpdateUserData({
        gender,
        dob,
        height,
        weight,
        sports,
      })
    );
    dispatch(userMetricsDataModalVisible(false, false));
  };

  // runs this function everytime the modal is opened
  useEffect(() => {
    if (
      visible &&
      currentUserMetricsData.gender != "No Data" &&
      !isFromSignupScreen
    ) {
      setGender(currentUserMetricsData.gender);
      // setDob(currentUserMetricsData.dob.toDate());
      setCent(Math.round(currentUserMetricsData.height * 2.54));
      setWeight(currentUserMetricsData.weight?.toString());
      setSports(currentUserMetricsData.sports);
    }
  }, [visible]);

  useEffect(() => {
    if (selectedHeight === "ft") {
      const feetValue = parseInt(feet) || 0;
      const inchesValue = parseInt(inches) || 0;
      const totalInches = feetValue * 12 + inchesValue;
      setHeight(totalInches);
      const centValue = Math.round(totalInches * 2.54);
      setCent(centValue);
    } else if (selectedHeight === "cm") {
      const centValue = parseInt(cent) || 0;
      const totalInches = Math.round(centValue / 2.54);
      setHeight(totalInches);
      const feetValue = Math.floor(totalInches / 12);
      const inchesValue = totalInches % 12;
      setFeet(feetValue);
      setInches(inchesValue);
    }
  }, [selectedHeight, feet, inches, cent]);

  useEffect(() => {
    if (selectedWeight === "lbs") {
      const weightValue = parseInt(weight) || 0;
      setWeight(weightValue);
      const kilogramValue = Math.round(poundsToKilograms(weight));
      setKilograms(kilogramValue);
    } else if (selectedWeight === "kg") {
      const weightValue = Math.round(kilogramsToPounds(kilograms));
      setWeight(weightValue);
    }
  }, [selectedWeight, weight, kilograms]);

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
                  {dob ? dob.toLocaleDateString() : "No Data"}
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
                  value={cent?.toString()}
                  mode="outlined"
                  keyboardType="numeric"
                  inputMode="numeric"
                  style={{ flex: 1 }}
                  onChangeText={(item) => {
                    setCent(item);
                    handleClearErrors();
                  }}
                  error={error.cent.length > 1 || error.selectHeight.length > 1}
                />
              )}
              {selectedHeight === "ft" && (
                <>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label="feet"
                      value={feet?.toString()}
                      mode="outlined"
                      keyboardType="numeric"
                      inputMode="numeric"
                      onChangeText={(item) => {
                        setFeet(item);
                        handleClearErrors();
                      }}
                      error={
                        error.feet.length > 1 || error.selectHeight.length > 1
                      }
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <TextInput
                      label="inches"
                      value={inches?.toString()}
                      mode="outlined"
                      keyboardType="numeric"
                      inputMode="numeric"
                      onChangeText={(item) => {
                        setInches(item);
                        handleClearErrors();
                      }}
                      error={
                        error.inches.length > 1 || error.selectHeight.length > 1
                      }
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
                  handleClearErrors();
                }}
                error={error.selectHeight.length > 1}
              />
            </View>
            {error.cent.length > 1 && (
              <HelperText type="error" visible={error.cent.length > 1}>
                {error.cent}
              </HelperText>
            )}
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
            {error.selectHeight.length > 1 && (
              <HelperText type="error" visible={error.selectHeight.length > 1}>
                {error.selectHeight}
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
              {selectedWeight !== "kg" && (
                <TextInput
                  label="Weight"
                  value={weight?.toString()}
                  mode="outlined"
                  keyboardType="numeric"
                  inputMode="numeric"
                  style={{ flex: 1 }}
                  onChangeText={(item) => {
                    setWeight(item);
                    handleClearErrors();
                  }}
                  error={
                    error.weight.length > 1 || error.selectWeight.length > 1
                  }
                />
              )}
              {selectedWeight === "kg" && (
                <TextInput
                  label="Weight"
                  value={kilograms?.toString()}
                  mode="outlined"
                  keyboardType="numeric"
                  inputMode="numeric"
                  style={{ flex: 1 }}
                  onChangeText={(item) => {
                    setKilograms(item);
                    handleClearErrors();
                  }}
                  error={error.weight.length > 1}
                />
              )}
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
                  handleClearErrors();
                }}
                error={error.selectWeight.length > 1}
              />
            </View>
            {error.weight.length > 1 && !(error.selectWeight.length > 1) && (
              <HelperText type="error" visible={error.weight.length > 1}>
                {error.weight}
              </HelperText>
            )}
            {error.selectWeight.length > 1 && (
              <HelperText type="error" visible={error.selectWeight.length > 1}>
                {error.selectWeight}
              </HelperText>
            )}

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
