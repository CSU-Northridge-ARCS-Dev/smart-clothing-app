import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView } from 'react-native';

// Background Image placeholder
const PlaceholderImage = require('./assets/images/background-image.png')

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Text content */}
      <Text>Welcome to the Smart Clothing Application!</Text>
      <StatusBar style="auto" />

      {/* Image container */}
      <View style={styles.imageContainer}>
        {/* Background Image */}
        <Image source={PlaceholderImage} style={styles.image} />
      </View>
    </SafeAreaView>
  );
}

{/* Background Image */}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
});
