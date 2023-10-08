import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { HelperText, TextInput, Button, Text } from "react-native-paper";
import { AppHeader } from "../../components";
import { AppFonts, AppStyle } from "../../constants/themes.js";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { useDispatch } from "react-redux";

import { auth, database } from "../../../firebaseConfig";
import {
  updateUserData,
  fetchUserData,
  startUpdateProfile,
} from "../../actions/userActions";

import MyDropdown from "../../components/UI/Dropdown/dropdown";
import { Dropdown } from "react-native-element-dropdown";

const ProfileScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { previousScreenTitle } = route.params;
  const [isLoading, setisLoading] = useState(true);
  const [age, setAge] = useState([
    { label: "Under 18", value: "Under 18" },
    { label: "18-24", value: "18-24" },
    { label: "25-34", value: "25-34" },
    { label: "35-44", value: "35-44" },
    { label: "45-54", value: "45-54" },
    { label: "55-64", value: "55-64" },
    { label: "65 or over", value: "65 or over" },
  ]);
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
    fname: "",
    lname: "",
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataFromFirebase = await fetchUserData(
          database,
          auth.currentUser.uid
        );
        setUserData(
          userDataFromFirebase || {
            fname: "",
            lname: "",
            age: "",
            gender: "",
            height: "",
            weight: "",
            sports: "",
          }
        );
        setisLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setisLoading(false);
      }
    };

    fetchData();
  }, []);

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
    dispatch(updateUserData(userData, auth.currentUser.uid));
    // }
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

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

        <View>
          <View>
            <TextInput
              label="First Name *"
              value={userData.fname}
              mode="outlined"
              onChangeText={(text) => {
                setUserData({ ...userData, fname: text });
              }}
              error={error.fname.length > 1}
            />
            <HelperText type="error" visible={error.fname.length > 1}>
              Please enter first name.
            </HelperText>
          </View>
          <View>
            <TextInput
              label="Last Name *"
              value={userData.lname}
              mode="outlined"
              onChangeText={(text) => {
                setUserData({ ...userData, lname: text });
              }}
              error={error.lname.length > 1}
            />
            <HelperText type="error" visible={error.lname.length > 1}>
              Please enter last name.
            </HelperText>
          </View>

          {/* <>
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                listMode="SCROLLVIEW"
                zIndex={1000}
                containerStyle={{
                  zIndex: 1000,
                  elevation: 1000,
                }}
                style={{
                  marginBottom: 28,
                  borderRadius: 0,
                  height: 40,
                  borderColor: "gray",
                  paddingLeft: 15,
                }}
                placeholderStyle={{ fontSize: 17, fontFamily: "sans-serif" }}
                placeholder={"Age"}
                searchable={true}
                scrollViewProps={{
                  nestedScrollEnabled: true,
                  persistentScrollbar: true,
                }}
              />
            </> */}

          <MyDropdown
            data={age}
            value={userData.age}
            placeholder={"Age"}
            onChange={(item) => {
              setUserData({ ...userData, age: item.value });
            }}
          />

          <MyDropdown
            data={gender}
            value={userData.gender}
            placeholder={"Gender"}
            onChange={(item) => {
              setUserData({ ...userData, gender: item.value });
            }}
          />

          <View>
            <TextInput
              label="Height"
              value={userData.height}
              mode="outlined"
              onChangeText={(text) => {
                setUserData({ ...userData, height: text });
              }}
              style={{ marginBottom: 28 }}
            />
          </View>
          <View>
            <TextInput
              label="Weight"
              value={userData.weight}
              mode="outlined"
              onChangeText={(text) => {
                setUserData({ ...userData, weight: text });
              }}
              style={{ marginBottom: 28 }}
            />
          </View>

          <MyDropdown
            data={sports}
            value={userData.sports}
            placeholder={"Sports"}
            onChange={(item) => {
              setUserData({ ...userData, sports: item.value });
            }}
          />
          <View style={styles.btnContainer}>
            <Button
              mode="elevated"
              style={{
                flex: 2,
                marginHorizontal: horizontalScale(10),
                marginVertical: verticalScale(10),
              }}
              onPress={() => {
                handleSaveProfile(userData);
              }}
            >
              Save
            </Button>
          </View>
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
  },
  content: {
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    transform: [{ translateY: -25 }],
    paddingTop: 25,
  },
  btnContainer: {
    marginVertical: 10,
    flexDirection: "row",
  },
});

export default ProfileScreen;
