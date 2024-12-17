import React, { useEffect, useState } from "react";
import { Modal, View, StyleSheet, Text, FlatList } from "react-native";
import { Switch, Button, HelperText } from "react-native-paper";
import { AppColor, AppFonts } from "../../constants/themes";
import { useDispatch, useSelector } from "react-redux";
import { getDoc } from "firebase/firestore";
import { removeFromPendingPermissions, startAddToCoachAccess, fetchPendingPermissions } from "../../actions/userActions";
import { coachNotificationPermissionsModalVisible } from "../../actions/appActions";

const NotificationPermissionsModal = (props) => {

  const dispatch = useDispatch();
  const visible = useSelector((state)=>state.app.coachNotificationPermissionsModalVisible);
  //const currentCoachAccess = useSelector((state) => state.user.coachAccess);
  const pendingCoachPermissions = useSelector((state) => state.user.pendingPermissions);

  const [permissions, setPermissions] = useState({});

  // Update permissions state when pending permissions change
  useEffect(() => {
    const initialPermissions = pendingCoachPermissions.reduce((acc, coach) => {
      acc[coach.coachId] = false; // Initialize each coach's permission to false
      return acc;
    }, {});
    console.log("Initial Permissions:", pendingCoachPermissions);
    console.log("Modal Visibility:", visible);
    setPermissions(initialPermissions);
  }, [pendingCoachPermissions]);

  useEffect(() => {
    dispatch(fetchPendingPermissions());
  }, [visible]);


  const togglePermission = (coachId) => {
    setPermissions((prev) => ({
      ...prev,
      [coachId]: !prev[coachId],
    }));
  };

  const acceptAll = () => {
    const updatedPermissions = Object.keys(permissions).reduce((acc, coachId) => {
      acc[coachId] = true;
      return acc;
    }, {});
    setPermissions(updatedPermissions);
    console.log("All permissions accepted:", updatedPermissions);
    //closeModal();
  };

  const handleSave = async () => {
    console.log("Saving permissions", permissions);
    try {
      // Extract the coach references where permissions are set to true
      const approvedCoaches = Object.keys(permissions).filter((coachId) => permissions[coachId]);
      console.log("Approved permissions for coaches:", approvedCoaches);
      // Resolve references for approved coaches
      const resolvedCoaches = await Promise.all(
      approvedCoaches.map(async (coachId) => {
        const coach = pendingCoachPermissions.find((coach) => coach.coachId === coachId);
        console.log("Resolving reference for coach ", coach);
        if (coach && coach.ref) {
          const coachDocSnap = await getDoc(coach.ref); // Ensure this is the DocumentReference
          if (coachDocSnap.exists()) {
            const coachData = coachDocSnap.data();
            return {
              coachId,
              firstName: coachData.firstName,
              lastName: coachData.lastName,
              ref: coach.ref,
            };
          }
        }
          return null;
        })
      );
      const validCoaches = resolvedCoaches.filter((coach) => coach !== null);
      console.log("Valid coaches resolved:", validCoaches);
      // Process each approved coach
      for (const coach of validCoaches) {
        console.log("Processing coach:", coach.coachId);
        // Create an updated list of pending permissions by removing the processed coach
        const updatePendingPermissions = pendingCoachPermissions.filter(
          (pendingCoach) => pendingCoach.coachId !== coach.coachId
        );
        // Remove the reference from pendingPermissions
        dispatch(removeFromPendingPermissions(coach, updatePendingPermissions));
        // Add the coach to the coachList
        dispatch(startAddToCoachAccess(coach));
        console.log("Permissions updated successfully for approved coaches.");
      }
    } catch (e) {
      console.error("Error handling permissions:", e);
    }
  };

  const renderPendingCoach = ({ item: coach }) => {
  if (!coach || !coach.coachId) {
    console.warn("Invalid coach object:", coach); // Debugging invalid entries
    return null; // Skip rendering if the coach object is invalid
  }

  return (
    <View style={styles.permissionContainer}>
      <Text style={styles.permissionTitle}>
        {coach.firstName} {coach.lastName}
      </Text>
      <Switch
        value={permissions[coach.coachId] || false}
        onValueChange={() => togglePermission(coach.coachId)}
      />
    </View>
  );
};

  // const renderPendingCoach = ({ item: coach }) => (
  //   <View style={styles.permissionContainer}>
  //     <Text style={styles.permissionTitle}>{coach.firstName} {coach.lastName}</Text>
  //     <Switch
  //       value={permissions[coach.coachId]}
  //       onValueChange={() => togglePermission(coach.coachId)}
  //     />
  //   </View>
  // );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={() => {
        dispatch(coachNotificationPermissionsModalVisible(false));
      }}
    >
      <View style={styles.modalContent}>
        <Text style={styles.title}>Permissions Request</Text>
        {props.coachName ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>
              Allow {props.coachName} to track your data?
            </Text>
            <Switch
              value={permissions[props.coachId] || false}
              onValueChange={() => togglePermission(props.coachId)}
            />
          </View>
        ) : null}
        <Text style={styles.subtitle}>Pending Coaches</Text>
        <FlatList
          data={pendingCoachPermissions}
          keyExtractor={(item) => item.coachId}
          renderItem={renderPendingCoach}
        />
        <View style={styles.btnContainer}>
          <Button 
          mode="outlined" 
          onPress={()=>{dispatch(coachNotificationPermissionsModalVisible(false))}} 
          style={styles.button}
          >
            Cancel
          </Button>
          <Button
            mode="outlined"
            onPress={acceptAll}
            style={[styles.button, { backgroundColor: AppColor.primary }]}
            labelStyle={styles.whiteText}
          >
            Accept All
          </Button>
          <Button
            mode="outlined"
            onPress={()=>{
              handleSave()
              dispatch(coachNotificationPermissionsModalVisible(false))
            }}
            style={[styles.button, { backgroundColor: AppColor.primary }]}
            labelStyle={styles.whiteText}
          >
            Save Changes
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    justifyContent: "center",
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontFamily: AppFonts.chakraBold,
    marginBottom: 20,
    textAlign: "center",
    color: AppColor.primary,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: AppFonts.chakraBold,
    marginBottom: 10,
    textAlign: "center",
    color: AppColor.secondary,
  },
  permissionContainer: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  permissionTitle: {
    fontSize: 18,
    color: AppColor.primary,
  },
  btnContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  button: {
    width: "32%",
  },
  whiteText: {
    color: "#fff", // Makes the text white
    fontSize: 14,
    fontFamily: AppFonts.chakraBold,
    width: "100%",
    textAlign: "center",
  },
});

export default NotificationPermissionsModal;
