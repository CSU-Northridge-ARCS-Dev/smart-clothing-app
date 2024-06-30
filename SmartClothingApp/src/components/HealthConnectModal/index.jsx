import React, { useEffect, useState } from "react";
import { View, Modal, StyleSheet, Button, Text, Linking } from "react-native";
import { AppColor } from "../../constants/themes";
import { SdkAvailabilityStatus } from "react-native-health-connect";
import { useDispatch } from "react-redux";
import { getHeartRateData, getSleepData } from "../../utils/HealthConnectUtils";
import { sendHeartRateData, sendSleepData } from "../../actions/userActions";
import { initialHealthDataSync } from "../../actions/appActions";


const HealthConnectModal = ({ visible, onClose, sdkStatus, onAccountCreation }) => { 
    
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const fetchAndStoreHCData = async () => {
      try {
        console.log("Fetching data...");
        setIsLoading(true);
        const heartRateData = await getHeartRateData(getLastYearDate(), getTodayDate());
        const sleepData = await getSleepData(getLastYearDate(), getTodayDate());
        await sendHeartRateData(heartRateData);
        await sendSleepData(sleepData);
        console.log("Data fetched successfully!");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
        dispatch(initialHealthDataSync(false));
      }
    };

    useEffect(() => {
        if (onAccountCreation) {
          fetchAndStoreHCData();
        }
      }, [onAccountCreation]);
    



    const getLastYearDate = () => new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const getTodayDate = () => new Date();


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
    //     // Check if SDK is available
    // }, []);

    
    return (
        <View style={styles.centeredView}>
         <Modal
          visible={visible}
          transparent={false}
          animationType="slide"
          contentContainerStyle={{
            backgroundColor: AppColor.primaryContainer,
            padding: 20,
          }}
          onRequestClose={() => {onClose}}
        >
          {console.log("Modal visible: ", visible)}
          <View style={styles.modalView}>
            <Text style={styles.modalText}
            >
              {sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE 
              ? "SDK is not available."
              : "SDK requires an update."}
            </Text>
            <View style={styles.buttonContainer}>
                <Button title="Go Back" onPress={onClose} />
              { sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED && (
                <Button title="Update Health Connect" onPress={openGooglePlayStore} />
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 60,
  },
  body: {
    padding: 10,
  },
  insights: {
    marginVertical: 10,
    elevation: 2,
    shadowColor: AppColor.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 5, height: 5 },
    backgroundColor: AppColor.primaryContainer,
    padding: 10,
  },
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

export default HealthConnectModal