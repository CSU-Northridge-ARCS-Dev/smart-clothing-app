import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { AppHeader } from "../../components";
import { AppFonts, AppStyle } from "../../constants/themes.js";
import { horizontalScale, verticalScale } from "../../utils/scale";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    repassword: "",
  });
  const [error, setError] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    repassword: "",
  });

  return (
    <ScrollView>
      <AppHeader title={"Profile"} back={true} menu={false} />
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
            value={user.fname}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, fname: text });
            }}
            error={error.fname.length > 1}
          />
        </View>
        <View>
          <TextInput
            label="Last Name"
            value={user.lname}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, lname: text });
            }}
            error={error.fname.length > 1}
          />
        </View>
        <View>
          <TextInput
            label="Age"
            value={user.fname}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, fname: text });
            }}
            error={error.fname.length > 1}
          />
        </View>
        <View>
          <TextInput
            label="Gender"
            value={user.fname}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, fname: text });
            }}
            error={error.fname.length > 1}
          />
        </View>
        <View>
          <TextInput
            label="Height"
            value={user.fname}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, fname: text });
            }}
            error={error.fname.length > 1}
          />
        </View>
        <View>
          <TextInput
            label="Weight"
            value={user.fname}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, fname: text });
            }}
            error={error.fname.length > 1}
          />
        </View>
        <View>
          <TextInput
            label="Sports"
            value={user.fname}
            mode="outlined"
            onChangeText={(text) => {
              setUser({ ...user, fname: text });
            }}
            error={error.fname.length > 1}
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