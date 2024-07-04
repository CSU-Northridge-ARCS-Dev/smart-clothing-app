import { React, useEffect } from 'react';
import { View, Modal, Button, Text, StyleSheet } from 'react-native';
import { AppColor } from "../../constants/themes";
import {
  aggregateRecord,
  getGrantedPermissions,
  initialize,
  insertRecords,
  getSdkStatus,
  readRecords,
  requestPermission,
  revokeAllPermissions,
  SdkAvailabilityStatus,
  openHealthConnectSettings,
  openHealthConnectDataManagement,
  readRecord,
} from "react-native-health-connect";
import { requestJSPermissions } from "../../services/HealthConnectServices/HealthConnectServices";

const HealthConnectModal = ({ modalVisible, sdkStatus, permissions, setModalVisible, openGooglePlayStore }) => {
  
  console.log("Rendering HealthConnectModal");

  useEffect(() => {
    const handlePermissions = async () => {
      if (modalVisible) {
        console.log("Modal is visible. Checking permissions...");
        //const permissions = await grantedPermissions();
        console.log("Permissions:", permissions);

        if (permissions) {
          console.log("Permissions granted.");
          //setPermissions(true);
          setModalVisible(false); // Close the modal if permissions are granted
        } else {
          console.log("Permissions not granted. Requesting permissions...");
          await requestJSPermissions();
        }
      }
    };

    handlePermissions();

  }, [modalVisible]);

  useEffect(() => {
    async function grantPermission() {
      if (permissions) {
        await requestJSPermissions();
      }
    };
    grantPermission();
  }, [permissions]);


  return (
    <View style={styles.centeredView}>
      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="slide"
        contentContainerStyle={{
          backgroundColor: AppColor.primaryContainer,
          padding: 20,
        }}
        onRequestClose={() => { setModalVisible(false) }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            {sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE 
              ? "SDK is not available."
              : "SDK requires an update."}
          </Text>
          <View style={styles.buttonContainer}>
            <Button title="Go Back" onPress={() => setModalVisible(false)} />
            {sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED && (
              <Button title="Update Health Connect" onPress={openGooglePlayStore} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

export default HealthConnectModal;
