# Smart-Textile Clothing App

## Introduction
The Smart Clothing App is a mobile platform interfacing with sensor-equipped wearables to collect and analyze real-time biometric data. Stored on Firestore real-time database cloud platforms, and locally, this data provides student athletes and their coaches with performance insights and personalized training recommendations. Additionally, it provides injury prevention and data sharing capabilities, the app integrates seamlessly into existing digital health ecosystems. All features are presented via an intuitive, user-friendly interface, ensuring easy access and comprehension of complex biometric data.

**Tech Stack**
* [![React Native][React Native]][ReactNative-url]
* [![Expo][Expo]][Expo-url]
* [![Firebase][Firebase]][Firebase-url]

## Table of Contents
- [Project Goals](#project-goals)
- [Scope of Functionalities](#scope-of-functionalities)
- [Push Notifications](#push-notifications)
- [Application Setup](#application-setup)
- [Application Launch](#application-launch)
- [Development Etiquette](#development-etiquette)
- [Troubleshooting](#troubleshooting)

## Project Goals
Smart textile products integrate the design research (environment and communication), physiology (human), and textile technology (E-textiles) all together. However, smart textiles are blind to many consumers with no sufficient knowledge in wearable technology to understand and analyze the real-time vital signs. Therefore, the main goal of this research is to figure out:

1. User-oriented/centered technology that reflects CSUN student-athletes’ latent smart textile needs through the wear test in smart textiles and users’ feedback in this wearable technology.
2. Development of an application that communicates with smart textiles using the collected authorized data shared by users, then processes and stores the data securely.
3. Deployment/application of a large-scale consumer research instrument based on the multi-method measurement of student-athletes’ wearing experience and user feedback.

A more outlined description can be found here: https://arcs.center/a-framework-for-smart-textile-large-scale-consumer-research/

## Scope of Functionalities
- **User authentication**
  - Log in/out via Firebase Authentication
  - Forgot password reset

- **Account management**
  - Edit profile: Name, date of birth, height, weight, sports
  - Change email/password
  - Delete health data
  - Delete account

- **Data collection & storage**
  - Pull metrics from user profile and wearable sources
  - Store health data in Firebase and locally
  - Integrate with Apple HealthKit (iOS) and Google Health Connect (Android)

- **Coach-athlete invite system**
  - Coaches can send invites to athletes
  - Athletes can manage coach permissions, pause sharing, or remove coach access

- **Work-in-progress**
  - Injury prevention (ML-based)
  - Export data to Boracle and third-party dashboards
  - Performance insight visualization

## Push Notifications

This app supports **Expo Push Notifications**, triggered from the **Coaching Dashboard** and delivered to athlete devices.

### ✅ Overview
- Coaches send invitations through the dashboard
- Athletes receive push notifications on their mobile device when:
  - An invite is sent
  - A coach takes certain actions

> This system enables real-time updates and enhanced coach-athlete coordination.

### 🔒 Apple Developer Note
To run push notifications on iOS:
- An Apple Developer account is required
- The app must be built using **EAS Build** with a **development profile**
- Team members should **never share login credentials**. Instead, request access to the Apple Developer Team from the account owner or admin.

To safely collaborate:
1. Project owner can invite others to Apple Dev Team via [App Store Connect](https://appstoreconnect.apple.com) → **Users and Access**
2. Assigned **Developer** role is sufficient for testing and EAS builds
3. For service accounts and `.env` setup related to push tokens, ask `@cfiguer055` directly

---

### 🛠 iOS Local Dev Instructions

> Expo Go workflow won’t work — must use dev build via EAS CLI

```bash
cd SmartClothingApp
npm install
````

**Terminal 1**: Build the dev client

```bash
eas build --platform ios --profile development
```

**Terminal 2**: Run metro server

```bash
npx expo start --clear
```

**Having trouble?**

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
# Repeat terminal 1 and 2 steps above
```

---

### 🛠 Android Instructions

```bash
cd SmartClothingApp
npm install
npx expo run:android
```

**If the build fails:**

```bash
cd android
./gradlew clean build
cd ..
npx expo run:android
```

Repeat until the issue clears.

---

### 📣 Integration With Coaching Dashboard

This notification system connects with the [Coaching Dashboard](https://github.com/CSU-Northridge-ARCS-Dev/coaching-dashboard):

* Coaches sign into their account
* Go to the **Invite Page**
* Enter an athlete’s email to send an invite
* Athletes receive a push notification and can:

  * Accept or reject the invite
  * Temporarily stop tracking
  * Permanently revoke coach access

For full dashboard setup, see:
[Dashboard README](https://github.com/CSU-Northridge-ARCS-Dev/coaching-dashboard)

---

## Application Setup

* Ensure Node.js is up to date
* Download Expo Go (only for testing non-push features)
* Ask admin for `.env` file with secure API keys
* Place `.env` in the root directory (outside `src/`)
* Run `npm install` before any development

---

## Application Launch

```bash
cd smartclothingapp
npx expo start
```

To bypass login/signup during dev:

* Open `reducers/userReducer.js`
* Set `uuid` to a valid value in `initialState`

---

## Development Etiquette

* `stable`: production-ready branch
* `main`: in-progress work, must be functional
* Dev branches should be regularly rebased and merged via PR
* All pull requests must be tested and reviewed

---

## Troubleshooting

* **"Main" not registered** → run:

```bash
npx expo start --clear
```

* **Android SDK PATH issue**:

  * Ensure correct path: `C:\Users\YOURNAME\AppData\Local\Android\Sdk`
  * Set it in `local.properties` as `sdk.dir=...`

* **Old JDK used**:

  * Use `JDK 17` (recommended)
  * Run `./gradlew stop` in `android/` to kill old daemon

---

[React Native]: https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB
[ReactNative-url]: https://reactnative.dev/
[Expo]: https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37
[Expo-url]: https://expo.dev/
[Firebase]: https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase
[Firebase-url]: https://firebase.google.com/
