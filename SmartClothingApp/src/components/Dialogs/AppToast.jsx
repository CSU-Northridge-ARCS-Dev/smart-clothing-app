import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { AppColor } from "../../constants/themes";
import { Text } from "react-native-paper";
import { horizontalScale } from "../../utils/scale";
import { useDispatch, useSelector } from "react-redux";
import { toastDiscard } from "../../actions/toastActions";
const AppToast = () => {
  const { error, message, show } = useSelector((state) => state.toast);
  const bottomFadeAnim = useRef(new Animated.Value(0)).current;
  const [exit, setExit] = useState(true);
  const open = (res) => {
    if (res) {
      Animated.timing(bottomFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(bottomFadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };
  const styles = StyleSheet.create({
    toast: {
      position: "absolute",
      backgroundColor: error ? AppColor.errorContainer : AppColor.primary,
      bottom: 20,
      width: horizontalScale(320),
      padding: 15,
      marginHorizontal: horizontalScale(20),
    },
    text: {
      color: error ? AppColor.error : AppColor.onPrimary,
    },
  });
  const dispatch = useDispatch();
  useEffect(() => {
    if (show) {
      setExit(false);
      open(true);
      setTimeout(() => {
        dispatch(toastDiscard());
      }, 3000);
    } else {
      open(false);
      setTimeout(() => {
        setExit(true);
      }, 2000);
    }
  }, [show]);
  return (
    <View>
      {!exit && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: bottomFadeAnim,
              transform: [
                {
                  translateY: bottomFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text variant="bodyMedium" style={styles.text}>
            {message}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

export default AppToast;
