import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
// import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
// import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { deleteFromCoachAccess } from "../../actions/userActions";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const RightActions = ({ onDelete, onToggle, onMore, isSharing }) => {
  return (
    <View style={styles.rightActionsContainer}>
      {/* Stop/Share Button */}
      <TouchableOpacity style={styles.actionButton} onPress={onToggle}>
        <View style={styles.actionButton}>
          <MaterialIcons 
            name={isSharing ? "block" : "check-circle"}
            size={24} 
            color="white" />
          <Text style={styles.actionText}>
            {isSharing ? "Stop" : "Share"}
          </Text>
        </View>
      </TouchableOpacity>
      {/* Delete Button */}
      <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
        <View style={styles.actionButton}>
          <FontAwesome name="trash" size={24} color="white" />
          <Text style={styles.actionText}>Delete</Text>
        </View>
      </TouchableOpacity>
      {/* More Button */}
      <TouchableOpacity style={styles.actionButton} onPress={onMore}>
        <View style={styles.actionButton}>
          <MaterialIcons name="more-horiz" size={24} color="white" />
          <Text style={styles.actionText}>More</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const CoachAccessSwipeAction = ({ coach, isSharing, onToggle }) => {
  const dispatch = useDispatch();

  // Handle Coach "Sharing" status
  // State to toggle between "Stop" and "Share"
  //const [isSharing, setIsSharing] = useState(true);
  // Handle "Stop/Share" toggle action
  const handleToggleSharing = () => {
    if (onToggle) {
      onToggle(); // Use the prop function passed from PermissionsModal
    }
    console.log(
      `Coach ${coach.firstName} ${coach.lastName} sharing state: ${
        isSharing ? "Disabled" : "Enabled"
      }`
    );
  };
  // const handleToggleSharing = () => {
  //   const newState = !isSharing;
  //   setIsSharing(newState);
  //   console.log(
  //     `Coach ${coach.firstName} ${coach.lastName} sharing state: ${
  //       newState ? "Enabled" : "Disabled"
  //     }`
  //   );
  // };

  // Handle Deleting
  const handleDelete = () => {
    dispatch(deleteFromCoachAccess(coach)); // Dispatch your action with coachId
    console.log(`Deleted Coach: ${coach.coachFirstName} ${coach.coachLastName}`);
  };

  // Handle "More" button (placeholder for modal)
  const handleMore = () => {
    console.log(`Opening Coach ${coach.firstName} ${coach.lastName} settings modal`);
  };

  return (
    <GestureHandlerRootView>
      <Swipeable
        friction={2}
        renderRightActions={() => (
          <RightActions 
            onDelete={handleDelete}
            onToggle={handleToggleSharing}
            onMore={handleMore}
            isSharing={isSharing}
          />
        )}
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
    marginHorizontal: 2,
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
    paddingHorizontal: 5,
    marginVertical: 5,
    marginRight: 2,
    alignItems: 'center',
    backgroundColor: '#f44336',
    borderRadius: 10,
    height: '85%',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default CoachAccessSwipeAction;
