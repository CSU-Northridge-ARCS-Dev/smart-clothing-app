import { useState, useEffect } from "react";
import {
  initializeHealthConnect,
  checkAvailability,
  requestJSPermissions,
  grantedPermissions,
} from "../utils/HealthConnectUtils";

const useHealthConnect = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [sdkStatus, setSdkStatus] = useState(null);
  const [isHealthConnectInitialized, setIsHealthConnectInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const status = await checkAvailability();
      setSdkStatus(status);

      if (status === "SDK_AVAILABLE") {
        const initialized = await initializeHealthConnect();
        setIsHealthConnectInitialized(initialized);
        
        const permissions = await grantedPermissions();
        if (!permissions || permissions.length === 0) {
          await requestJSPermissions();
        }
      } else {
        setModalVisible(true);
      }
    };

    initialize();
  }, []);

  return { modalVisible, sdkStatus, isHealthConnectInitialized, setModalVisible };
};

export default useHealthConnect;
