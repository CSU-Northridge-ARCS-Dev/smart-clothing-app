import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
// import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
// import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const RightActions = () => {
  return (
    <View style={styles.rightActionsContainer}>
      <View style={styles.actionButton}>
        <MaterialIcons name="block" size={24} color="white" />
        <Text style={styles.actionText}>Stop</Text>
      </View>
      <View style={styles.actionButton}>
        <FontAwesome name="trash" size={24} color="white" />
        <Text style={styles.actionText}>Delete</Text>
      </View>
      <View style={styles.actionButton}>
        <MaterialIcons name="more-horiz" size={24} color="white" />
        <Text style={styles.actionText}>More</Text>
      </View>
    </View>
  );
};

const CoachAccessSwipeAction = ({ coach }) => {
  return (
    <GestureHandlerRootView>
      <Swipeable
        friction={2}
        renderRightActions={() => <RightActions />}
        rightThreshold={40}
      >
        <View style={styles.coachContainer}>
          <Text style={styles.coachName}>{coach.firstName} {coach.lastName}</Text>
        </View>
      </Swipeable>
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  coachContainer: {
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    marginVertical: 5,
  },
  coachName: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'ChakraPetch-Regular',
  },
  rightActionsContainer: {
    flexDirection: 'row', // Horizontal alignment
    justifyContent: 'flex-end',
    paddingVertical: 5,
    paddingHorizontal: 20,
    marginVertical: 5,
    alignItems: 'center',
    backgroundColor: '#f44336',
    borderRadius: 10,
    height: '85%',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});












// function RightAction({ prog, drag }) {
//   const styleAnimation = useAnimatedStyle(() => {
//     console.log('showRightProgress:', prog.value);
//     console.log('appliedTranslation:', drag.value);

//     return {
//       //transform: [{ translateX: drag.value + 50 }], // Animating the swipe action
//       transform: [{ translateX: Math.max(drag.value, -150) }], // Restrict translation
//     };
//   });

//   // return (
//   //   <Reanimated.View style={styleAnimation}>
//   //     <Text style={styles.rightAction}>Delete</Text>
//   //   </Reanimated.View>
//   // );
//   return (
//     <Reanimated.View style={[styles.rightActionContainer, styleAnimation]}>
      
//       <View style={styles.actionButton}>
//         <MaterialIcons name="block" size={24} color="white" />
//         <Text style={styles.actionText}>Stop</Text>
//       </View>
//       <View style={styles.actionButton}>
//         <FontAwesome name="trash" size={24} color="white" />
//         <Text style={styles.actionText}>Delete</Text>
//       </View>
//       <View style={styles.actionButton}>
//         <MaterialIcons name="more-horiz" size={24} color="white" />
//         <Text style={styles.actionText}>More</Text>
//       </View>
//     </Reanimated.View>

//     // <Reanimated.View style={[styles.rightActionContainer, styleAnimation]}>
//     //   <Text style={styles.rightActionText}>Delete</Text>
//     // </Reanimated.View>
//   );
// }

// const CoachAccessSwipeAction = ({ coach, progress, drag }) => {
//   return (
//     <GestureHandlerRootView>
//       <ReanimatedSwipeable
//         containerStyle={styles.swipeableContainer}
//         friction={2}
//         enableTrackpadTwoFingerGesture
//         rightThreshold={40}
//         renderRightActions={(progress, dragX) => <RightAction prog={progress} drag={dragX} />}
//       >
//         {/* <Text style={styles.coachText}>{coach.firstName} {coach.lastName}</Text> */}
//         <View style={styles.coachContainer}>
//           <Text style={styles.coachName}>
//             {coach.firstName} {coach.lastName}
//           </Text>
//         </View>
//       </ReanimatedSwipeable>
//     </GestureHandlerRootView>
//   );
// };

// const styles = StyleSheet.create({
//   swipeableContainer: {
//     marginVertical: 5,
//     borderRadius: 10,
//     backgroundColor: 'white',
//     padding: 15,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   coachContainer: {
//     justifyContent: 'center',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//   },
//   coachName: {
//     fontSize: 18,
//     color: '#333',
//     fontFamily: 'ChakraPetch-Regular',
//   },
//   coachText: {
//     fontSize: 18,
//     color: '#333',
//     fontFamily: 'ChakraPetch-Regular', // Replace with the actual font from your theme
//   },
//   rightActionContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f44336', // Red background for delete action
//     borderRadius: 10,
//     padding: 10,
//     marginRight: 10,
//   },
//   // rightActionText: {
//   //   color: 'white',
//   //   fontWeight: 'bold',
//   //   fontSize: 16,
//   // },
//   actionButton: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 80,
//     marginHorizontal: 5,
//   },
//   actionText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 12,
//   },
// });

















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
