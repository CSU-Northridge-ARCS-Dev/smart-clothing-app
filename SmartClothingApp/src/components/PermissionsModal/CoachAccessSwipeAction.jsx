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

  // return (
  //   <Reanimated.View style={styleAnimation}>
  //     <Text style={styles.rightAction}>Delete</Text>
  //   </Reanimated.View>
  // );
  return (
    <Reanimated.View style={[styles.rightActionContainer, styleAnimation]}>
      <Text style={styles.rightActionText}>Delete</Text>
    </Reanimated.View>
  );
}

const CoachAccessSwipeAction = ({ coach, progress, drag }) => {
  return (
    <GestureHandlerRootView>
      <ReanimatedSwipeable
        containerStyle={styles.swipeableContainer}
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
  swipeableContainer: {
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  coachText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'ChakraPetch-Regular', // Replace with the actual font from your theme
  },
  rightActionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f44336', // Red background for delete action
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  rightActionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

// const styles = StyleSheet.create({
//   rightAction: {
//     width: 50,
//     height: 50,
//     backgroundColor: 'red',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 5,
//   },
//   swipeable: {
//     height: 50,
//     backgroundColor: 'papayawhip',
//     alignItems: 'center',
//     marginBottom: 10,
//     borderRadius: 5,
//   },
//   coachText: {
//     fontSize: 18,
//     padding: 10,
//     color: 'black',
//   },
// });

export default CoachAccessSwipeAction;
