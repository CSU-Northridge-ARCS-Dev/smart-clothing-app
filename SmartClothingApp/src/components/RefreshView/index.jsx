import React, { useCallback, useState } from "react";
import { ScrollView, RefreshControl } from "react-native";

function useRefresh() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
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
