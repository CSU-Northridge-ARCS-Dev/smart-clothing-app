import React, { useState } from "react";
import { Modal, View, StyleSheet, Text, FlatList } from "react-native";
import { Switch, Button, HelperText } from "react-native-paper";
import { AppColor, AppFonts } from "../../constants/themes";
import { useDispatch } from "react-redux";
import { removeFromPendingPermissions, addToCoachList } from "../../actions/userActions";

const NotificationPermissionsModal = ({ 
  visible, 
  closeModal, 
  coachName, 
  coachId,
  pendingCoaches 
}) => {
  const [permissions, setPermissions] = useState(
    pendingCoaches.reduce((acc, coachId) => {
      acc[coachId] = false;
      return acc;
    }, {})
  );
  const dispatch = useDispatch();

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

  const handleSave = () => {
    console.log("Saving permissions:", permissions);
    
    try {
      //console.log("Permissions:", permissions);
      // Extract the coach IDs where permissions are set to true
      const approvedCoaches = Object.keys(permissions).filter((coachId) => permissions[coachId]);
      console.log("Applying permissions:", approvedCoaches);  
      // Dispatch actions to update the athlete's data
      approvedCoaches.forEach((coachId) => {
        console.log("Removing coach:", coachId);
        // Remove coachId from pendingPermissions and add to coachList
        dispatch(removeFromPendingPermissions(coachId));
        dispatch(addToCoachList(coachId));
      });

      console.log("Updated pending permissions and coach list for the student");
    } catch (e) {
      console.log("Error extracting coach IDs:", e);
    }
    // Change local state here


    closeModal();
  };

  const renderPendingCoach = ({ item: coach }) => (
    <View style={styles.permissionContainer}>
      <Text style={styles.permissionTitle}>{coach}</Text>
      <Switch
        value={permissions[coach]}
        onValueChange={() => togglePermission(coach)}
      />
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalContent}>
        <Text style={styles.title}>Permissions Request</Text>
        {coachName && (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>
              Allow {coachName} to track your data?
            </Text>
            <Switch
              value={permissions[coachId] || false}
              onValueChange={() => togglePermission(coachId)}
            />
          </View>
        )}
        <Text style={styles.subtitle}>Pending Coaches</Text>
        <FlatList
          data={pendingCoaches}
          keyExtractor={(item) => item}
          renderItem={renderPendingCoach}
        />
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
          <Button
            mode="outlined"
            onPress={handleSave}
            style={[styles.button, { backgroundColor: AppColor.primary }]}
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
    width: "30%",
  },
});

export default NotificationPermissionsModal;
