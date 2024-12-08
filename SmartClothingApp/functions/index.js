const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Expo} = require("expo-server-sdk");

admin.initializeApp();

const db = admin.firestore();
const expo = new Expo();

/**
 * Function to send a push notification using Expo SDK
 * @param {string} pushToken - Expo push token
 * @param {string} message - Notification message
 */
function sendPushNotification(pushToken, title, message, data) {
  const messages = [
    {
      to: pushToken,
      sound: "default",
      title: title,
      body: message,
      data: data, // No space after '{' and before '}'
    },
  ];

  expo.sendPushNotificationsAsync(messages)
    .then((receipts) => { // Add parentheses around arrow function argument
      console.log("Push notifications sent:", receipts);
    })
    .catch((error) => { // Add parentheses around arrow function argument
      console.error("Error sending push notifications:", error);
    });
}

exports.sendInvitationNotification = functions.firestore
  .document("Invitations/{invitationId}")
  .onCreate((snap, context) => {
    const newInvitation = snap.data();
    const athleteEmail = newInvitation.athleteEmail;
    const coachId = newInvitation.coachId;
    const coachName = newInvitation.coachName;

    const usersRef = db.collection("Users");
    usersRef.where("email", "==", athleteEmail).get()
      .then((snapshot) => { // Add parentheses around arrow function argument
        if (snapshot.empty) {
          console.log("No matching documents.");
          return;
        }
        snapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.expoPushToken) {
            sendPushNotification(
              userData.expoPushToken, 
              `Allow Coach ${coachName} to Track Your Data?`,
              "Coach wants access to your fitness data for " + 
              "tracking and insights. Allow sharing?",
              {
                screen: "Home",
                showPermissionsModal: true,
                coachName: coachName,
                coachId: coachId,
              },
            );
          }
        });
      })
      .catch((err) => {
        console.log("Error getting documents", err);
      });
  });

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});
