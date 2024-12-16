import React, { useState, useEffect } from "react";
import { Modal, View, StyleSheet, Text, FlatList, TouchableOpacity } from "react-native";
import { Switch, Button, HelperText } from "react-native-paper";
import { AppColor, AppFonts } from "../../constants/themes";
import { useDispatch, useSelector } from "react-redux";
import { getDoc } from "firebase/firestore";
import { removeFromPendingPermissions, startAddToCoachAccess, fetchPendingPermissions, fetchCoachAccess } from "../../actions/userActions";
import { Swipeable } from 'react-native-gesture-handler';
import Animated  from 'react-native-reanimated'; 
import CoachAccessSwipeAction from "./CoachAccessSwipeAction";



const PermissionsModal = ({ visible, closeModal }) => {
  const dispatch = useDispatch();
  const [healthDataPermission, setHealthDataPermission] = useState(false);
  const [coachDataPermission, setCoachDataPermission] = useState(false);
  const [error, setError] = useState("");

  const pendingCoachPermissions = useSelector((state) => state.user.pendingPermissions);
  const currentCoachAccess = useSelector((state) => state.user.coachAccess);

  const [permissions, setPermissions] = useState({});

  const [activeCoach, setActiveCoach] = useState(null);  


  useEffect(() => {
    dispatch(fetchPendingPermissions());
    dispatch(fetchCoachAccess());
  }, [visible]);

  useEffect(() => {
    const initialPermissions = pendingCoachPermissions.reduce((acc, coach) => {
      acc[coach.coachId] = false; // Initialize each coach's permission to false
      return acc;
    }, {});
    console.log("Initial Permissions:", pendingCoachPermissions);
    console.log("Modal Visibility:", visible);
    setPermissions(initialPermissions);
  }, [pendingCoachPermissions]);

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
      closeModal();
    } catch (e) {
      console.error("Error handling permissions:", e);
    }
  };

  // const handleSave = () => {
  //   // Example logic to save permissions, typically involves updating backend state or Firestore
  //   if (healthDataPermission === undefined || coachDataPermission === undefined) {
  //     setError("Please review all permissions.");
  //   } else {
  //     // Save permissions (update backend or Firestore here)
  //     console.log("Saving permissions...");
  //     closeModal(); // Close modal after saving
  //   }
  // };


  
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

  // Handle the long press event to activate additional actions (in this case, delete)
  const renderRightActions = (coachId, progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });
    const safeScale = isNaN(scale) ? 1 : scale;

    return (
      <Animated.View
        //style={[styles.deleteContainer, { transform: [{ scale }] }]}
        style={[styles.deleteContainer, { transform: [{ scale: safeScale }] }]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            setActiveCoach(coachId);
            deleteCoach(coachId)
          }}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };


  const renderCoachItem = ({ item: coach }) => (
    <CoachAccessSwipeAction
      coach={coach}
      progress={null} // You can pass your progress prop if needed
      drag={null} // You can pass your drag prop if needed
    />
  );

  // const renderCoachItem = ({ item: coach }) => (
  //   <Swipeable
  //     renderRightActions={(progress, dragX) => renderRightActions(coach.coachId, progress, dragX)}
  //   >
  //     <View
  //       style={[
  //         styles.coachContainer,
  //         activeCoach === coach.coachId && styles.activeCoach, // Apply red background if coach is being deleted
  //       ]}
  //     >
  //       <Text style={styles.coachName}>{coach.firstName} {coach.lastName}</Text>
  //       <Switch
  //         value={coach.isActive}
  //         onValueChange={() => toggleCoachSwitch(coach.coachId)}
  //       />
  //     </View>
  //   </Swipeable>
  // );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalContent}>
        <Text style={styles.title}>Manage Permissions</Text>
        <View style={styles.permissionContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.permissionTitle}>Health Data Sharing</Text>
            <HelperText type="info">Allow the app to access your health data for personalized insights.</HelperText>
          </View>
          <Switch
            value={healthDataPermission}
            onValueChange={(val) => setHealthDataPermission(val)}
            style={styles.switch}
          />
        </View>

        <View style={styles.permissionContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.permissionTitle}>Coach Data Sharing</Text>
            <HelperText type="info">Allow your coach to track your health and fitness data.</HelperText>
          </View>
          <Switch
            value={coachDataPermission}
            onValueChange={(val) => setCoachDataPermission(val)}
          />
        </View>

        <Text style={styles.subtitle}>Pending Coaches</Text>
        <FlatList
          data={pendingCoachPermissions}
          keyExtractor={(item) => item.coachId}
          renderItem={renderPendingCoach}
        />

        <Text style={styles.subtitle}>Approved Coaches</Text>
        <FlatList
          data={currentCoachAccess}
          keyExtractor={(item) => item.coachId}
          renderItem={renderCoachItem}
        />

        <View style={styles.btnContainer}>
          <TouchableOpacity onPress={closeModal} style={styles.button}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("Save Changes")} style={styles.button}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

        {error && <HelperText type="error">{error}</HelperText>}

        <View style={styles.btnContainer}>
          <Button mode="outlined" onPress={closeModal} style={styles.button}>
            Cancel
          </Button>
          <Button
            mode="outlined"
            onPress={acceptAll}
            style={[styles.button, { backgroundColor: AppColor.primary }]}
          >
            Accept All
          </Button>
          <Button mode="outlined" onPress={handleSave} style={[styles.button, { backgroundColor: AppColor.primary }]}>
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
  permissionContainer: {
    width:'100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  textContainer: {
    flex: 0.9,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  switch: {
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: AppFonts.chakraBold,
    marginBottom: 10,
    textAlign: "center",
    color: AppColor.secondary,
  },
  permissionTitle: {
    marginLeft: 10,
    fontSize: 18,
    color: AppColor.primary,
  },
  coachContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
  },
  activeCoach: {
    backgroundColor: "#ffcccc", // Red background indicating deletion
  },
  coachName: {
    fontSize: 18,
    color: AppColor.primary,
    flex: 1,
  },
  deleteContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffcccc", // Light red background for delete action
    height: "100%",
    padding: 20,
  },
  deleteButton: {
    backgroundColor: "#f44336", // Red for delete button
    padding: 10,
    borderRadius: 5,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
  btnContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  button: {
    width: "30%",
  },
});

export default PermissionsModal;
