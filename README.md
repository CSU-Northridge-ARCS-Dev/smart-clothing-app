# Smart-Textile Clothing App

## Introduction
The Smart Clothing App is a mobile platform interfacing with sensor-equipped wearables to collect and analyze real-time biometric data. Stored on Firestore real-time database cloud platforms, and locally, this data provides student athletes and their coaches with performance insights and personalized training recommendations. Additionally, it provides injury prevention and data sharing capabilities, the app integrates seamlessly into existing digital health ecosystems. All features are presented via an intuitive, user-friendly interface, ensuring easy access and comprehension of complex biometric data.

**Tech Stack**
* [![React Native][React Native]][ReactNative-url]
* [![Expo][Expo]][Expo-url]
* [![Firebase][Firebase]][Firebase-url]

## Table of Contents
- <a href="#project-goals">Project Goals</a>
- <a href="#application-setup">Application Setup</a>
- <a href="#application-launch">Application Launch</a>
- <a href="#development-etiquette">Development Etiquette</a>
- <a href="#troubleshooting">Troubleshooting</a>

## Project Goals
Smart textile products integrate the design research (environment and communication), physiology (human), and textile technology (E-textiles) all together. However, smart textiles are blind to many consumers with no sufficient knowledge in wearable technology to understand and analyze the real-time vital signs. Therefore, the main goal of this research is to figure out:

1) User-oriented/centered technology that reflects CSUN student-athletes’ latent smart textile needs through the wear test in smart textiles and users’ feedback in this wearable technology.
2) Development of an application that communicates with smart textiles using the collected authorized data shared by users, then processes and stores the data securely.
3) Deployment/application of a large-scale consumer research instrument based on the multi-method measurement of student-athletes’ wearing experience and user feedback.

A more outlined description can be found here: https://arcs.center/a-framework-for-smart-textile-large-scale-consumer-research/

## Scope of functionalities
- User authentication
  - Functionality to log in and out with an account made in Firebase
  - Forgot password
- Account management
  - Edit profile
    - User metrics data (age, height, weight, sports, date of birth)
    - First name and last name stored in authentication
  - Settings
    - Delete health data using time ranges
    - Update email into a new one
    - Change password
    - Delete account
- Data storage
    - All the data gets pushed into Firebase
- Data collection
    - Retrieves user metrics data from the application itself through the account management system
    - Retrieves health data from Apple HealthKit and Google Health Connect

- Work-in-progress
  - Injury prevention
    - Use machine learning with all the data to provide injury prevention and training recommendations
  - Data sharing
    - Export data to a JSON/CSV format to a third-party platform like Boracle
  - Performance insights
    - Show trends and insights based on the data
  
## Application Setup
- Ensure node version is up to date
- Contact admin for setting up .env file
- Download Expo Go app on your mobile device.
- You will need a .env file that is used to hold API keys. This file is not uploaded on github for security reasons.
- Create a .env file outside of the src folder and enter the API keys. To get the API keys contact the project admin.

## Application Launch
```bash
cd smartclothingapp
npx expo start
```
To bypass login/signup page:
- Go to reducers->userreducers.js
- under initialState change uuid to true

## Development Etiquette
- Stable branch will be used to store the most stable version of the application. This branch must have a functioning and running application all the time.
- Main branch can be used to work together and for implementation and testing etc. Code must be able to run.
- All the other branches will be used for development and testing.
- Pull requests must be reviewed and tested thoroughly before approval.

## Troubleshooting
- Error Code: "Main" has not been registered.
    - Run: ```npx expo start --clear```
- Must have JDK 17 to run the latest version.
- Android Studio Build, PATH variable:
    - go to settings
    - type in: ```edit system variables```
    - add ```C:\\Users\\ReplaceWithYourUser\\AppData\\Local\\Android\Sdk``` (this path can be found from Android Studio by going to the SDK Manager)
    - set sdk.dir to the same path as well
- Should Android build use the old path for JDK instead of the new one set up (even after deletion)
    - You must go to the android folder and run the command ./gradlew stop to stop the old daemon process

[React Native]: https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB
[ReactNative-url]: https://reactnative.dev/
[Expo]: https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37
[Expo-url]: https://expo.dev/
[Firebase]: https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase
[Firebase-url]: https://firebase.google.com/


