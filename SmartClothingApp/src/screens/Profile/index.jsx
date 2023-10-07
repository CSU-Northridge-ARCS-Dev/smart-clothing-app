import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { HelperText, TextInput, Button, Text } from "react-native-paper";
import { AppHeader } from "../../components";
import { AppFonts, AppStyle } from "../../constants/themes.js";
import { horizontalScale, verticalScale } from "../../utils/scale";
import { useDispatch } from "react-redux";

import { auth } from "../../../firebaseConfig";
import { updateUserData } from "../../actions/userActions";
// import { getDoc, doc } from "firebase/firestore"; // Import Firebase Firestore functions

const ProfileScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { previousScreenTitle } = route.params;
  const [isSubmitting, setIsSubmitting] = useState(true);

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

  // const [uid, setUid] = useState("");

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
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user data:", error);
  //     }
  //   };

  //   fetchUserData();
  // }, []);

  const handleSaveProfile = () => {
    const filteredUserData = {};
    for (const key in userData) {
      if (userData[key] !== "") {
        filteredUserData[key] = userData[key];
      }
    }
    if (Object.values(filteredUserData).length > 0) {
      dispatch(updateUserData(filteredUserData, auth.currentUser.uid));
    }
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
        <View>
          <TextInput
            label="First Name"
            value={userData.fname}
            mode="outlined"
            onChangeText={(text) => {
              setUserData({ ...userData, fname: text });
              console.log(userData.fname);
            }}
          />
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
        </View>
        <View>
          <TextInput
            label="Age"
            value={userData.age}
            mode="outlined"
            onChangeText={(text) => {
              setUserData({ ...userData, age: text });
            }}
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
