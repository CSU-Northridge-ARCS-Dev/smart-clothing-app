import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, Button } from 'react-native';
import { oauthSignIn } from './APIs/Hexoskin_API'

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

        <Button
          onPress={oauthSignIn}
          title="Learn More"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
      </View>
    </SafeAreaView>
  );
}
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
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
