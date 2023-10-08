import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { HelperText, TextInput, Button, Text } from "react-native-paper";
import { AppHeader } from "../../components";
import { AppFonts, AppStyle } from "../../constants/themes.js";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { useDispatch } from "react-redux";

import { auth, database } from "../../../firebaseConfig";
import { updateUserData, fetchUserData } from "../../actions/userActions";

const ProfileScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { previousScreenTitle } = route.params;
  const [isLoading, setisLoading] = useState(true);

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
    age: "",
    gender: "",
    height: "",
    weight: "",
    sports: "",
  });

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
        setUserData(userDataFromFirebase);
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
      dispatch(updateUserData(userData, auth.currentUser.uid));
    // }
  };

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

        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View>
            <View>
              <TextInput
                label="First Name"
                value={userData.fname}
                mode="outlined"
                onChangeText={(text) => {
                  setUserData({ ...userData, fname: text });
                }}
              />
              <HelperText type="error" visible={error.fname.length > 1}>
                Please enter first name.
              </HelperText>
            </View>
            <View>
              <TextInput
                label="Last Name"
                value={userData.lname}
                mode="outlined"
                onChangeText={(text) => {
                  setUserData({ ...userData, lname: text });
                }}
              />
              <HelperText type="error" visible={error.lname.length > 1}>
                Please enter last name.
              </HelperText>
            </View>
            <View>
              <TextInput
                label="Age"
                value={userData.age}
                mode="outlined"
                onChangeText={(text) => {
                  setUserData({ ...userData, age: text });
                }}
                style={{ marginBottom: 28 }}
              />
            </View>
            <View>
              <TextInput
                label="Gender"
                value={userData.gender}
                mode="outlined"
                onChangeText={(text) => {
                  setUserData({ ...userData, gender: text });
                }}
                style={{ marginBottom: 28 }}
              />
            </View>
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
            <View>
              <TextInput
                label="Sports"
                value={userData.sports}
                mode="outlined"
                onChangeText={(text) => {
                  setUserData({ ...userData, sports: text });
                }}
                style={{ marginBottom: 16 }} // Add marginBottom for spacing
              />
            </View>
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
        )}
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
