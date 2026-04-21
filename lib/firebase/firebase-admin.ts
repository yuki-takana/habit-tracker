import admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

export const sendPushNotification = async (
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, string>
) => {
    const result = await admin.messaging().send({
        token: fcmToken,
        data: {
            title: title || "UFL Habit Tracker",
            body: body || "",
            url: "/todos",
            ...data,
        },
        webpush: {
            headers: { Urgency: "high" },
        }
    });
    console.log("[FCM Admin] Message sent:", result);
};