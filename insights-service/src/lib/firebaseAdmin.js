const { initializeApp, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getConfig } = require("../config");

// verifyIdToken checks the token against Google's public certs, so only the
// project ID is needed 
function getAdminApp() {
  const existing = getApps();
  if (existing.length) return existing[0];
  return initializeApp({ projectId: getConfig().firebaseProjectId });
}

async function verifyIdToken(idToken) {
  return getAuth(getAdminApp()).verifyIdToken(idToken);
}

module.exports = { verifyIdToken };
