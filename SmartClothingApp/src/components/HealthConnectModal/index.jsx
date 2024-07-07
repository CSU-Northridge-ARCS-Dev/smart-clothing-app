import { React, useEffect, useState } from 'react';
import { View, Modal, Button, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppColor } from "../../constants/themes";
import { requestPermissions } from "../../actions/healthConnectActions";
import { getSdkAvailabilityStatus } from "../../services/HealthConnectServices/HealthConnectServices";


const HealthConnectModal = ({ modalVisible, sdkStatus, permissions, setPermissions, setModalVisible, openGooglePlayStore }) => {
  
  console.log("Rendering HealthConnectModal");
  const dispatch = useDispatch();

  const handlePermissions = async () => {
    if (modalVisible) {
      console.log("Modal is visible. Checking permissions...");
      console.log("Permissions:", permissions);

      if (!permissions) {
        console.log("Permissions not granted. Requesting permissions...");
        dispatch(requestPermissions());
      } else {
        console.log("Permissions granted.");
        setModalVisible(false); // Close the modal if permissions are granted
      }
    }
  };

  useEffect(() => {
    handlePermissions();
  }, [modalVisible, permissions, dispatch]);


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
        visible={false}  // Visbility set to false because not needed. 
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
            {sdkStatus === getSdkAvailabilityStatus.SDK_UNAVAILABLE 
              ? "SDK is not available."
              : "SDK requires an update."}
          </Text>
          <View style={styles.buttonContainer}>
            <Button title="Go Back" onPress={() => setModalVisible(false)} />
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
