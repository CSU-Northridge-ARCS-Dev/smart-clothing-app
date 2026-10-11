const { verifyIdToken } = require("../lib/firebaseAdmin");

// Requires "Authorization: Bearer <Firebase ID token>" and sets req.uid.
async function requireFirebaseUser(req, res, next) {
  const header = req.get("Authorization") || "";
  const match = header.match(/^Bearer (.+)$/);

  if (!match) {
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }

  try {
    const decoded = await verifyIdToken(match[1]);
    req.uid = decoded.uid;
    return next();
  } catch (error) {
    console.warn("Firebase ID token rejected:", error.code || error.message);
    return res.status(401).json({ error: "UNAUTHENTICATED" });
  }
}

module.exports = requireFirebaseUser;
