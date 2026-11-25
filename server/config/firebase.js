const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const path = require("path");
const fs = require("fs");

let firebaseApp = null;
let firebaseAuth = null;

function initFirebase() {
  if (firebaseAuth) return firebaseAuth;

  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
    firebaseAuth = getAuth(firebaseApp);
    return firebaseAuth;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  const options = {};

  if (serviceAccountKey) {
    try {
      let parsedCreds;
      if (serviceAccountKey.trim().startsWith("{")) {
        parsedCreds = JSON.parse(serviceAccountKey);
      } else {
        const resolvedPath = path.isAbsolute(serviceAccountKey)
          ? serviceAccountKey
          : path.join(__dirname, "..", serviceAccountKey);
        if (fs.existsSync(resolvedPath)) {
          parsedCreds = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
        }
      }

      if (parsedCreds) {
        options.credential = cert(parsedCreds);
        if (parsedCreds.project_id && !projectId) {
          options.projectId = parsedCreds.project_id;
        }
      }
    } catch (err) {
      console.warn("Could not load Firebase service account key:", err.message);
    }
  }

  if (projectId && !options.projectId) {
    options.projectId = projectId;
  }

  if (!options.credential && !options.projectId) {
    return null;
  }

  try {
    firebaseApp = initializeApp(options);
    firebaseAuth = getAuth(firebaseApp);
    return firebaseAuth;
  } catch (error) {
    console.error("Firebase admin initialization failed:", error.message);
    return null;
  }
}

async function verifyFirebaseToken(idToken) {
  const auth = initFirebase();

  if (!auth) {
    throw new Error(
      "Firebase Admin is not configured on the server. Please set FIREBASE_PROJECT_ID or FIREBASE_SERVICE_ACCOUNT_KEY in server/.env"
    );
  }

  const decoded = await auth.verifyIdToken(idToken);
  return decoded;
}

module.exports = {
  initFirebase,
  verifyFirebaseToken,
};
