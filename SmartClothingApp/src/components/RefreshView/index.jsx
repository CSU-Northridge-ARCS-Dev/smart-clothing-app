import React, { useCallback, useState } from "react";
import { ScrollView, RefreshControl } from "react-native";

import FirebaseHealthKitService from "../../services/AppleHealthKit/firebaseHealthKitService";

function useRefresh() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      FirebaseHealthKitService.updateWithLatestData();
      setRefreshing(false);
    }, 500);  // Add extra delay.
  }, []);

  return { refreshing, onRefresh };
}

function RefreshView({ children }) {
  const { refreshing, onRefresh } = useRefresh();

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={{ flex: 1 }}
    >
      {children}
    </ScrollView>
  );
}

export default RefreshView;
