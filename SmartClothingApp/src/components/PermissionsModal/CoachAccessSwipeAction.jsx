import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';

function RightAction({ prog, drag }) {
  const styleAnimation = useAnimatedStyle(() => {
    console.log('showRightProgress:', prog.value);
    console.log('appliedTranslation:', drag.value);

    return {
      transform: [{ translateX: drag.value + 50 }], // Animating the swipe action
    };
  });

  return (
    <Reanimated.View style={styleAnimation}>
      <Text style={styles.rightAction}>Delete</Text>
    </Reanimated.View>
  );
}

const CoachAccessSwipeAction = ({ coach, progress, drag }) => {
  return (
    <GestureHandlerRootView>
      <ReanimatedSwipeable
        containerStyle={styles.swipeable}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={(progress, dragX) => <RightAction prog={progress} drag={dragX} />}
      >
        <Text style={styles.coachText}>{coach.firstName} {coach.lastName}</Text>
      </ReanimatedSwipeable>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  rightAction: {
    width: 50,
    height: 50,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  swipeable: {
    height: 50,
    backgroundColor: 'papayawhip',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 5,
  },
  coachText: {
    fontSize: 18,
    padding: 10,
    color: 'black',
  },
});

export default CoachAccessSwipeAction;
