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

  export default function HealthModule() {

    const initializeHealthConnect = async () => {
        const result = await initialize();
        console.log({ result });
        setIsHealthConnectInitialized(result);
        return result;
      };
    
      const checkAvailability = async () => {
    
        const status = await getSdkStatus();
        setSdkStatus(status);
        console.log({ status });
        if (status === SdkAvailabilityStatus.SDK_AVAILABLE) {
          console.log("SDK is available");
    
          const isInitialized = await setIsHealthConnectInitialized();
          if (!isInitialized) {
            await initializeHealthConnect();
          }
    
          console.log("Hit health connect initialized")
            console.log("Hit initialized");
            const permissions = grantedPermissions()
            console.log("Hit granted permissions");
            if (!permissions || permissions.length === 0) {
              requestJSPermissions()
              console.log("recieved permissions")
            }
          }
    
        if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) {
          console.log("SDK is not available");
          setModalVisible(true);
        }
    
        if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
          console.log("SDK is not available, provider update required");
          setModalVisible(true);
        }
      };
    
      const requestJSPermissions = () => {
        requestPermission([
          {
            // if changing this, also change in app.json (located in the project root folder) and/or AndroidManifest.xml (located in android/app/src/main/AndroidManifest.xml)
            // need to add heart rate & sleep data
            accessType: "read",
            recordType: "Steps",
          },
          {
            accessType: "write",
            recordType: "Steps",
          },
        ]).then((permissions) => {
          console.log("Granted permissions on request ", { permissions });
        });
      };
    
      const grantedPermissions = () => {
        getGrantedPermissions().then((permissions) => {
          console.log("Granted permissions ", { permissions });
          return permissions;
        });
      };
    return {
      // return statement
      
    };
  }