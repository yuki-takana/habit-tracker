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
            title,
            body,
            ...data,
        },

        android: {
            priority: "high",
        },
        webpush: {
            headers: { Urgency: "high" },
            notification: {
                title, 
                body,
                icon: "https://habits.hellocoders.in/UFLLogo.png",
                badge: "https://habits.hellocoders.in/UFLLogo.png",
                vibrate: [200, 100, 200],
            },
            fcmOptions: { link: "https://habits.hellocoders.in" },
        },
    });
    console.log("[FCM Admin] Message sent:", result);
};