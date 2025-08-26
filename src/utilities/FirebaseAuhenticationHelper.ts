// import admin from "firebase-admin";
// import logger from "../../logger";
// import AppError from "./ErrorHandler";

// let serviceAccount: any = {
//   type: process.env.FIREBASE_TYPE as string,
//   projectId: process.env.FIREBASE_PROJECT_ID as string,
//   privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID as string,
//   privateKey: process.env.FIREBASE_PRIVATE_KEY as string,
//   clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
//   clientId: process.env.FIREBASE_CLIENT_ID as string,
//   authUri: process.env.FIREBASE_AUTH_URI as string,
//   tokenUri: process.env.FIREBASE_TOKEN_URI as string,
//   authProviderX509CertUrl: process.env
//     .FIREBASE_AUTH_PROVIDER_X509_CERT_URL as string,
//   clientX509CertUrl: process.env.FIREBASE_CLIENT_CERT_URL as string,
//   universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN as string,
// };

// admin.initializeApp({
//   credential: admin.credential.cert(JSON.parse(JSON.stringify(serviceAccount))),
// });

// // export const sendMultiplePushNotification = async (
// //   tokens: string[],
// //   data: any
// // ) => {
// //   const batches = [];
// //   const batchSize = 100;
// //   const recipientSize = tokens.length;

// //   const message = {
// //     data,
// //     tokens,
// //   };

// //   for (let i = 0; i < recipientSize; i += batchSize) {
// //     const batchTokens = tokens.slice(i, i + batchSize);
// //     const batchMessage = { ...message };
// //     batchMessage.tokens = batchTokens;

// //     // console.log({batchMessage});
// //     await admin
// //       .messaging()
// //       .sendEachForMulticast(batchMessage)
// //       .then((response) => {
// //         logger.info(`Batch push notification sent successfully`);
// //       })
// //       .catch((error) => {
// //         throw new AppError(400, `Batch push notification failed: ${error}`);
// //       });
// //     // batches.push(batchMessage);
// //   }

// //   // console.log({
// //   //   data: batches[0].data,
// //   //   tokens: batches[0].tokens,
// //   // });
// // };

// // export const sendPushNotification = async (token: string, data: any) => {
// //   const message = {
// //     data,
// //     token,
// //   };

// //   await admin
// //     .messaging()
// //     .send(message)
// //     .then((response) => {
// //       logger.info(`Push notification sent successfully: ${response}`);
// //     })
// //     .catch((error) => {
// //       logger.error(` Push notification failed: ${error}`);
// //     });
// // };

// export const loginWithGoogleHelper = async (idToken: string) => {
//   // Verify the ID token
//   const decodedToken = await admin.auth().verifyIdToken(idToken);

//   // Get user info
//   const { email, name, email_verified, uid } = decodedToken;

//   const [firstname, lastname] = name.split(" ");

//   if (!email) {
//     throw new AppError(403, "Email not verified");
//   }

//   // Return user email and additional data if needed
//   return { email, firstname, lastname };
// };
