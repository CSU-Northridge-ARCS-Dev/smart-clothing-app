# Services Directory

Provided by: Gerard Gandionco on April 19, 2024.

## Overview

This directory contains backend service classes for integrating with external health services such as Apple HealthKit and Google Health Connect. Each service is designed to interact with its respective health platform and perform synchronizations with our Firebase Firestore database.

This is also meant to be extended to external smart wearable devices and to write services for those as well. 

## Structure

`/AppleHealthKit`
- `healthKitService.js` - Service class for interfacing with Apple HealthKit.
- `firebaseHealthKitService.js` - Handles Firestore queries and data uploads specific to Apple HealthKit data.

`/GoogleHealthConnect`
- TODO

...