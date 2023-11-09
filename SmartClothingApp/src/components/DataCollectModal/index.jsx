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
  DateTimePickerA
} from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";

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

  let dobDate = currentUserMetricsData.dob;

  if(currentUserMetricsData.dob.seconds !== undefined && currentUserMetricsData.dob.nanoseconds !== undefined) {
    dobDate = dobDate.seconds * 1000;
  }

  const [gender, setGender] = useState("");
  const [dob, setDob] = useState(new Date());
  const [height, setHeight] = useState(0);
  const [weight, setWeight] = useState(0);
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

  const poundsToKilograms = (value) => {
    var kilograms = Math.round(value / 2.20462);
    return `${kilograms} kg`;
  };

  const handleSubmit = () => {
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

  const inchesToFeetInches = (value) => {
    const feet = Math.floor(value / 12);
    const remainingInches = value % 12;
    return `${feet}'${remainingInches}"`;
  };

  const inchesToCentimeters = (value) => {
    const centimeters = Math.round(value * 2.54);
    return `${centimeters} cm`;
  };

  // runs this function everytime the modal is opened
  useEffect(() => {
    if (
      visible &&
      currentUserMetricsData.gender != "No Data" &&
      !isFromSignupScreen
    ) {
      setGender(currentUserMetricsData.gender);
      setDob(new Date(dobDate));
      setHeight(currentUserMetricsData.height);
      setWeight(currentUserMetricsData.weight);
      setSports(currentUserMetricsData.sports);
    }
  }, [visible]);

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

            <View style={styles.itemContainer}>
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
            </View>

            <View style={{ marginVertical: 10, gap: 15 }}>
              <Text style={styles.sliderText}>
                {inchesToFeetInches(height)} ({inchesToCentimeters(height)})
              </Text>
              <Slider
                value={height}
                maximumValue={118}
                minimumValue={0}
                onValueChange={(value) => {
                  setHeight(Math.floor(value));
                }}
              />
              <Text style={styles.sliderText}>
                {weight} lbs ({poundsToKilograms(weight)})
              </Text>
              <Slider
                value={weight}
                maximumValue={800}
                minimumValue={0}
                onValueChange={(value) => {
                  setWeight(Math.floor(value));
                }}
              />
            </View>

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
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
  },
  itemContainer: {
    width: "100%",
    gap: 34,
    marginVertical: 10,
  },
  sliderText: {
    textAlign: "center",
    fontSize: 17,
  },
});

export default DataCollectModal;
