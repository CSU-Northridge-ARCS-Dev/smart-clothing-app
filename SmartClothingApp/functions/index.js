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
function sendPushNotification(pushToken, message) {
  const messages = [
    {
      to: pushToken,
      sound: "default",
      body: message,
      data: {someData: "Some data"}, // No space after '{' and before '}'
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
              userData.expoPushToken, "You've received a new invitation!");
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
