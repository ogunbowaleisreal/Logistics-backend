import admin from "firebase-admin";
import AppError from "./ErrorHandler";

const initFirebase = (() => {
  let initialized = false;
  return () => {
    if (initialized) return;
    admin.initializeApp({
      credential: admin.credential.cert({
        type: "service_account",
        projectId: process.env.FIREBASE_PROJECT_ID as string,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID as string,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY as string)?.replace(
          /\\n/g,
          "\n",
        ),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
        clientId: process.env.FIREBASE_CLIENT_ID as string,
        authUri: "https://accounts.google.com/o/oauth2/auth",
        tokenUri: "https://oauth2.googleapis.com/token",
        authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
        clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL as string,
        universeDomain: "googleapis.com",
      } as admin.ServiceAccount),
    });
    initialized = true;
  };
})();

export const loginWithGoogleHelper = async (idToken: string) => {
  initFirebase();

  const decoded = await admin.auth().verifyIdToken(idToken);
  const { uid, email, name, email_verified } = decoded;

  if (!email) {
    throw new AppError(403, "Google account has no verified email");
  }

  const [firstname = "", lastname = ""] = (name ?? "").split(" ");

  return { uid, email, firstname, lastname, emailVerified: email_verified };
};
