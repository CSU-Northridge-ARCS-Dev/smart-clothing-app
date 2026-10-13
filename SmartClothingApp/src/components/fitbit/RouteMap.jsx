import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { WebView } from "react-native-webview";

import { routeMapHtml, routeSegments } from "../../utils/workoutRoute";
import { fitbitCardStyles as card, ZONE_COLORS } from "./styles";
import ZoneLegend from "./ZoneLegend";

// A run's GPS route, each stretch colored by the heart rate zone at that point.
// Drawn with Leaflet in a WebView, which needs no Google Maps API key.
// points: [{ lat, lon, zone }] from the service.
const RouteMap = ({ points, style }) => {
  const html = routeMapHtml(routeSegments(points), ZONE_COLORS);
  if (!html) return null;

  return (
    <View style={[card.card, style]} testID="route-map">
      <Text style={card.title}>Route</Text>
      <View style={styles.mapFrame}>
        <WebView
          testID="route-webview"
          originWhitelist={["*"]}
          source={{ html }}
          style={styles.webview}
          scrollEnabled={false}
          setBuiltInZoomControls={false}
          nestedScrollEnabled
        />
      </View>
      <ZoneLegend />
    </View>
  );
};

const styles = StyleSheet.create({
  mapFrame: {
    height: 280,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 8,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default RouteMap;
