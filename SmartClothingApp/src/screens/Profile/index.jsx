import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { HelperText, TextInput, Button, Text } from "react-native-paper";
import { AppHeader } from "../../components";
import { AppFonts, AppStyle, AppColor } from "../../constants/themes.js";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { useDispatch } from "react-redux";

import { auth, database } from "../../../firebaseConfig";
import {
  updateUserData,
  fetchUserData,
  startUpdateProfile,
} from "../../actions/userActions";
import { userMetricsDataModalVisible } from "../../actions/appActions";
import LoadingOverlay from "../../components/UI/LoadingOverlay";

const ProfileScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { previousScreenTitle } = route.params;
  const [isLoading, setisLoading] = useState(true);

  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();

  // const [age, setAge] = useState([
  //   { label: "Under 18", value: "Under 18" },
  //   { label: "18-24", value: "18-24" },
  //   { label: "25-34", value: "25-34" },
  //   { label: "35-44", value: "35-44" },
  //   { label: "45-54", value: "45-54" },
  //   { label: "55-64", value: "55-64" },
  //   { label: "65 or over", value: "65 or over" },
  // ]);
  const [gender, setGender] = useState([
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ]);
  const [sports, setSports] = useState([
    { label: "Volleyball", value: "Volleyball" },
    { label: "Basketball", value: "Basketball" },
    { label: "Baseball", value: "Baseball" },
    { label: "American Football", value: "American Football" },
    { label: "Rugby", value: "Rugby" },
    { label: "Tennis", value: "Tennis" },
    { label: "Badminton", value: "Badminton" },
    { label: "Running", value: "Running" },
    { label: "Soccer", value: "Soccer" },
    { label: "Table Tennis", value: "Table Tennis" },
  ]);

  const [userData, setUserData] = useState({
    fname: auth.currentUser.displayName.split(" ")[0],
    lname: auth.currentUser.displayName.split(" ")[1],
    age: "",
    gender: "",
    height: "",
    weight: "",
    sports: "",
  });

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

    if (userData.lname.length < 1) {
      errors.lname = "Must have a last name.";
      flag = false;
    }

    setError({ ...errors });
    return flag;
  };

  const handleClearErrors = () => {
    setError({
      fname: "",
      lname: "",
    });
  };

  const handleClear = () => {
    setUserData({
      fname: "",
      lname: "",
      age: "",
      gender: "",
      height: "",
      weight: "",
      sports: "",
    });
  };

  const handleUpdateProfile = () => {
    if (!isValid()) {
      return;
    }
    setIsSubmitting(true);

    dispatch(startUpdateProfile(firstName, lastName));
  };

  // useEffect(() => {
  //   const userData = auth.currentUser;
  //   if (userData) {
  //     setUid(userData.uid);
  //   }
  // }, []);

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const userDocRef = doc(database, "Users", auth.currentUser.uid);
  //       const userDoc = await getDoc(userDocRef);

  //       if (userDoc.exists()) {
  //         const userDataFromFirebase = userDoc.data();
  //         setUserData(userDataFromFirebase);
  //         setisLoading(false);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user data:", error);
  //       setisLoading(false);
  //     }
  //   };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const userDataFromFirebase = await fetchUserData(
  //         database,
  //         auth.currentUser.uid
  //       );
  //       setUserData(
  //         userDataFromFirebase || {
  //           fname: auth.currentUser.displayName.split(" ")[0],
  //           lname: auth.currentUser.displayName.split(" ")[1],
  //           age: "",
  //           gender: "",
  //           height: "",
  //           weight: "",
  //           sports: "",
  //         }
  //       );
  //       setisLoading(false);
  //     } catch (error) {
  //       console.error("Error fetching user data:", error);
  //       setisLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const handleSaveProfile = () => {
    // const filteredUserData = {};
    // for (const key in userData) {
    //   if (userData[key] !== "") {
    //     filteredUserData[key] = userData[key];
    //   }
    // }
    // if (Object.values(filteredUserData).length > 0) {

    const filteredUserData = { ...userData };
    delete filteredUserData.fname;
    delete filteredUserData.lname;

    if (!isValid()) {
      return;
    }

    dispatch(startUpdateProfile(userData.fname, userData.lname));
    dispatch(updateUserData(filteredUserData, auth.currentUser.uid));
    // }
  };

  // if (isLoading) {
  //   return <LoadingOverlay />;
  // }

  return (
    <ScrollView>
      <AppHeader title={previousScreenTitle} back={true} menu={false} />
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
            <Text style={{ fontSize: 18 }}>{userData.fname}</Text>
          </View>

          <Text variant="titleMedium" style={{ marginTop: 20 }}>
            Last Name
          </Text>
          <Text style={{ fontSize: 18 }}>{userData.lname}</Text>
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
                onPress={() => dispatch(userMetricsDataModalVisible(true))}
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
          <Text style={{ fontSize: 18 }}>64</Text>

          <Text variant="titleMedium" style={{ marginTop: 20 }}>
            Height
          </Text>
          <Text style={{ fontSize: 18 }}>bibash</Text>

          <Text variant="titleMedium" style={{ marginTop: 20 }}>
            Weight
          </Text>
          <Text style={{ fontSize: 18 }}>bibash</Text>

          <Text variant="titleMedium" style={{ marginTop: 20 }}>
            Sports
          </Text>
          <Text style={{ fontSize: 18 }}>bibash</Text>
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
