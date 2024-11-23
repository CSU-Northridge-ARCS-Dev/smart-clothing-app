import React, { useState } from "react";
import { Modal, View, StyleSheet, Text } from "react-native";
import { Switch, Button, HelperText } from "react-native-paper";
import { AppColor, AppFonts } from "../../constants/themes";

const PermissionsModal = ({ visible, closeModal }) => {
  const [healthDataPermission, setHealthDataPermission] = useState(false);
  const [coachDataPermission, setCoachDataPermission] = useState(false);
  const [error, setError] = useState("");

  const handleSave = () => {
    // Example logic to save permissions, typically involves updating backend state or Firestore
    if (healthDataPermission === undefined || coachDataPermission === undefined) {
      setError("Please review all permissions.");
    } else {
      // Save permissions (update backend or Firestore here)
      console.log("Saving permissions...");
      closeModal(); // Close modal after saving
    }
  };

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
          <Text style={styles.permissionTitle}>Health Data Sharing</Text>
          <HelperText type="info">Allow the app to access your health data for personalized insights.</HelperText>
          <Switch
            value={healthDataPermission}
            onValueChange={(val) => setHealthDataPermission(val)}
          />
        </View>

        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Coach Data Sharing</Text>
          <HelperText type="info">Allow your coach to track your health and fitness data.</HelperText>
          <Switch
            value={coachDataPermission}
            onValueChange={(val) => setCoachDataPermission(val)}
          />
        </View>

        {error && <HelperText type="error">{error}</HelperText>}

        <View style={styles.btnContainer}>
          <Button mode="outlined" onPress={closeModal} style={styles.button}>
            Cancel
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
    marginBottom: 20,
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
    width: "45%",
  },
});

export default PermissionsModal;
