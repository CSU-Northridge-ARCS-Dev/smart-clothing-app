import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { HelperText, TextInput, Button, Text } from "react-native-paper";
import { AppHeader, DataCollectModal } from "../../components";
import { AppFonts, AppStyle, AppColor } from "../../constants/themes.js";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { useDispatch, useSelector } from "react-redux";

import { auth, database } from "../../../firebaseConfig";
import {
  startUpdateUserData,
  fetchUserData,
  startUpdateProfile,
} from "../../actions/userActions";
import PersonalModal from "../../components/PersonalModal/PersonalModal";
import { userMetricsDataModalVisible } from "../../actions/appActions";
import LoadingOverlay from "../../components/UI/LoadingOverlay";

const ProfileScreen = ({ navigation, route }) => {
  const { gender, dob, height, weight, sports } = useSelector(
    (state) => state.user.userMetricsData
  );
  let dobDate = dob;

  const { firstName, lastName } = useSelector((state) => state.user);
  const [age, setAge] = useState("");

  const dispatch = useDispatch();
  const { previousScreenTitle } = route.params;

  const [isPersonalModalVisible, setPersonalModalVisible] = useState(false);

  const openPersonalModal = () => {
    setPersonalModalVisible(true);
  };

  const closePersonalModal = () => {
    setPersonalModalVisible(false);
  };

  const [error, setError] = useState({
    fname: "",
    lname: "",
  });

  const isValid = () => {
    let flag = true;
    let errors = error;

    if (userData.fname.length < 1) {
      errors.fname = "Must have a first name.";
      flag = false;
    }
  };

  const formatHeight = (height) => {
    if (height) {
      const feet = Math.floor(height / 12);
      const inches = height % 12;
      return `${feet}'${inches}"`;
    }
  };

  useEffect(() => {
    if (dob) {
      if (dob.seconds !== undefined && dob.nanoseconds !== undefined) {
        dobDate = dob.toDate();
      }
      let age = new Date().getFullYear() - new Date(dobDate).getFullYear();

      if (
        new Date().getMonth() < new Date(dobDate).getMonth() ||
        (new Date().getMonth() === new Date(dobDate).getMonth() &&
          new Date().getDate() < new Date(dobDate).getDate())
      ) {
        age -= 1;
      }
      console.log("calculated age = ", age);
      setAge(age);
    }
  }, [dob]);

  return (
    <ScrollView>
      <AppHeader title={previousScreenTitle} back={true} menu={false} />
      <PersonalModal
        visible={isPersonalModalVisible}
        closeModal={closePersonalModal}
        firstName={firstName}
        lastName={lastName}
      />
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            AppStyle.textPrimary,
            { fontFamily: AppFonts.chakraBold },
          ]}
        >
          Edit Profile
        </Text>
      </View>

      <View style={styles.container}>
        <View style={styles.content}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[styles.subTitle, AppStyle.textPrimary]}>
              Personal
            </Text>
            <View style={styles.btnContainer}>
              <Button
                mode="elevated"
                buttonColor="#1560a4"
                textColor="white"
                style={{ borderRadius: 10 }}
                onPress={openPersonalModal}
              >
                EDIT
              </Button>
            </View>
          </View>
          <View
            style={{
              borderBottomColor: "black",
              borderBottomWidth: StyleSheet.hairlineWidth,
            }}
          />
        </View>
        <View style={{ marginLeft: 18 }}>
          <View>
            <Text variant="titleMedium">First Name</Text>
            <Text style={{ fontSize: 18 }}>{firstName}</Text>
          </View>

          <Text variant="titleMedium" style={{ marginTop: 20 }}>
            Last Name
          </Text>
          <Text style={{ fontSize: 18 }}>{lastName}</Text>
        </View>
        <View style={[styles.content, { paddingTop: 25 }]}>
          <View
            style={{
              borderBottomColor: "black",
              borderBottomWidth: StyleSheet.hairlineWidth,
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[styles.subTitle, AppStyle.textPrimary]}>
              Metrics Data
            </Text>
            <View style={styles.btnContainer}>
              <Button
                mode="elevated"
                buttonColor="#1560a4"
                textColor="white"
                onPress={() =>
                  dispatch(userMetricsDataModalVisible(true, false))
                }
                currentUserData={{
                  gender,
                  dob,
                  height,
                  weight,
                  sports,
                }}
                style={{ borderRadius: 10 }}
              >
                EDIT
              </Button>
            </View>
          </View>
          <View
            style={{
              borderBottomColor: "black",
              borderBottomWidth: StyleSheet.hairlineWidth,
            }}
          />
        </View>

        <View style={{ marginLeft: 20, marginBottom: 40 }}>
          <Text variant="titleMedium">Age</Text>
          <Text style={{ fontSize: 18 }}>
            {dob ? `${age} Years` : "No Data"}
          </Text>

          <Text variant="titleMedium" style={{ marginTop: 20 }}>
            Height
          </Text>
          <Text style={{ fontSize: 18 }}>{formatHeight(height)}</Text>

          <Text variant="titleMedium" style={{ marginTop: 20 }}>
            Weight
          </Text>

          <Text style={{ fontSize: 18 }}>
            {weight ? `${weight} lbs` : weight}
          </Text>

          <Text variant="titleMedium" style={{ marginTop: 20 }}>
            Gender
          </Text>
          <Text style={{ fontSize: 18 }}>{gender}</Text>

          <Text variant="titleMedium" style={{ marginTop: 20 }}>
            Sports
          </Text>
          <Text style={{ fontSize: 18 }}>{sports}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    marginVertical: 24,
    textAlign: "center",
    paddingTop: 45,
  },
  subTitle: {
    fontSize: 24,
    marginVertical: 24,
    fontFamily: AppFonts.chakraBold,
    flex: 1,
    marginLeft: 15,
  },
  content: {
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginBottom: 20,
  },
  btnContainer: { flex: 1, alignItems: "flex-end", marginRight: 20 },
  container: {
    backgroundColor: AppColor.primaryContainer,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 8,
  },
});

export default ProfileScreen;
