# Smart-Textile Clothing App

The Smart Clothing App is a mobile platform interfacing with sensor-equipped wearables to collect and analyze real-time biometric data. Stored on Firestore real-time database cloud platforms, and locally, this data provides student athletes and their coaches with performance insights and personalized training recommendations. Additionally, it provides injury prevention and data sharing capabilities, the app integrates seamlessly into existing digital health ecosystems. All features are presented via an intuitive, user-friendly interface, ensuring easy access and comprehension of complex biometric data.

## Project Goals

Smart textile products integrate the design research (environment and communication), physiology (human), and textile technology (E-textiles) all together. However, smart textiles are blind to many consumers with no sufficient knowledge in wearable technology to understand and analyze the real-time vital signs. Therefore, the main goal of this research is to figure out:

1) User-oriented/centered technology that reflects CSUN student-athletes’ latent smart textile needs through the wear test in smart textiles and users’ feedback in this wearable technology.
2) Development of an application that communicates with smart textiles using the collected authorized data shared by users, then processes and stores the data securely.
3) Deployment/application of a large-scale consumer research instrument based on the multi-method measurement of student-athletes’ wearing experience and user feedback.

A more outlined description can be found here: https://arcs.center/a-framework-for-smart-textile-large-scale-consumer-research/

## Setting Up the Application
- Ensure node version is up to date
- Contact admin for setting up .env file
- Download Expo Go app on your mobile device.

### Setting Up .env File
- You will need a .env file that is used to hold API keys. This file is not uploaded on github for security reasons.
- Create a .env file outside of the src folder and enter the API keys. To get the API keys contact the project admin.

## Running the Application
```bash
cd smartclothingapp
npx expo start
```
To bypass login/signup page:
- Go to redurcers->userredurces.js
- under initialState change uuid to true


## Resources
- Expo Doc link: https://docs.expo.dev/get-started/installation/ 
- React Bootstrap doc: https://react-bootstrap.netlify.app/docs/getting-started/introduction

## Developing Etiquette

- Stable branch will be used to store the most stable version of the application. This branch must have a functioning and running application all the time.
- Main branch can be used to work together and for implementation and testing etc. Code must be able to run.
- All the other branches will be used for development and testing. Etiquette to be decided.

## Troubleshooting
- Error Code: "Main" has not been registered.
    Run: ```npx expo start --clear```
  
- Android Studio Build, PATH variable: 
