import { React, useEffect, useState } from 'react';
import { View, Modal, Button, Text, StyleSheet, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppColor } from "../../constants/themes";
import { requestHCPermissions, setHealthConnectPermissions, setHealthConnectModalVisible } from "../../actions/healthConnectActions";
import { getSdkAvailabilityStatus } from "../../services/HealthConnectServices/HealthConnectServices";


const HealthConnectModal = () => {
  console.log("Rendering HealthConnectModal");
  const dispatch = useDispatch();

  const healthConnectModalVisible = useSelector((state) => state.healthConnect.healthConnectModalVisible);
  const sdkStatus = useSelector((state) => state.healthConnect.sdkStatus);
  const permissions = useSelector((state) => state.healthConnect.permissions);

  const healthKitModalVisible = false; // Temp


  const handlePermissions = async () => {
    if (healthConnectModalVisible) {
      console.log("Modal is visible. Checking permissions...");
      console.log("Permissions:", permissions);

      if (!permissions) {
        console.log("Permissions not granted. Requesting permissions...");
        dispatch(requestHCPermissions());
        //dispatch(setHealthConnectPermissions(true));  <-- taken care of in actions
      } else {
        console.log("Permissions granted.");
        dispatch(setHealthConnectModalVisible(false)) // Close the modal if permissions are granted
      }
    }
    else if (healthKitModalVisible) {
      // IOS Health Kit Modal and Permissions



    }
  };

  useEffect(() => {
    handlePermissions();
  }, [
    healthConnectModalVisible, 
    permissions, 
    healthKitModalVisible,
    dispatch
  ]);


  const openGooglePlayStore = async () => {
    const healthConnectBetaUrl = "market://details?id=com.google.android.apps.healthdata";
    try {
      if (await Linking.canOpenURL(healthConnectBetaUrl)) {
        Linking.openURL(healthConnectBetaUrl);
      } else {
        console.error("Cannot open Google Play Store");
        // TODO: show error message to user
        // this one means that we cannot open the google play store and returned from Linking
      }
    } catch (error) {
      console.error("Error opening Google Play Store", error);
      // TODO: show error message to user
      // this one means that we cannot open the google play store and errored out of try block
    }
  };


  // useEffect(() => {
  //   const handlePermissions = async () => {
  //     if (modalVisible) {
  //       console.log("Modal is visible. Checking permissions...");
  //       console.log("Permissions:", permissions);

  //       if (!permissions) {
  //         console.log("Permissions not granted. Requesting permissions...");
  //         dispatch(requestPermissions());

  //       } else {
  //         console.log("Permissions granted.");
  //         setModalVisible(false); // Close the modal if permissions are granted
  //       }
  //     }
  //   };

  //   handlePermissions();
  // }, [modalVisible, permissions, setModalVisible]);



 // Modal to display if SDK is not available or requires an update
  return (
    <View style={styles.centeredView}>
      <Modal
        visible={sdkStatus?.length > 0 ?? false}  // Visbility set to false because not needed. 
        transparent={false}
        animationType="slide"
        contentContainerStyle={{
          backgroundColor: AppColor.primaryContainer,
          padding: 20,
        }}
        onRequestClose={() => { dispatch(setHealthConnectModalVisible(false)) }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            {sdkStatus === getSdkAvailabilityStatus.SDK_UNAVAILABLE 
              ? "SDK is not available."
              : "SDK requires an update."}
          </Text>
          <View style={styles.buttonContainer}>
            <Button title="Go Back" onPress={() => dispatch(setHealthConnectModalVisible(false))} />
            {sdkStatus === getSdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED && (
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
