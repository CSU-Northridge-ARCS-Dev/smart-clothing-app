//TODO: Setup Good Error Message (https://firebase.google.com/docs/auth/admin/errors)

export const firebaseErrorMessages = {
  "Firebase: Error (auth/invalid-email).": "Invalid email address format.",
  "Firebase: Error (auth/email-already-in-use).":
    "Email address already in use.",
  "Firebase: Error (auth/weak-password).":
    "Password should be at least 6 characters.",
  "Firebase: Error (auth/user-not-found).": "User not found.",
  "Firebase: Error (auth/wrong-password).": "Incorrect password.",
  "Firebase: Error (auth/too-many-requests).":
    "Too many requests. Try again later.",
  "Firebase: Error (auth/network-request-failed).":
    "Network error. Try again later.",
  "Firebase: Error (auth/operation-not-allowed).": "Operation not allowed.",
  "Firebase: Error (auth/user-disabled).": "User disabled.",
  "Firebase: Error (auth/invalid-verification-code).":
    "Invalid verification code.",
  "Firebase: Error (auth/invalid-verification-id).": "Invalid verification ID.",
  "Firebase: Error (auth/invalid-credential).": "Invalid credential.",
};
