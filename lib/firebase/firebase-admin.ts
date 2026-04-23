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
    const targetUrl = data?.url || "/todos";
    const result = await admin.messaging().send({
        token: fcmToken,
        // data payload for service-worker custom handling
        data: {
            title: title || "UFL Habit Tracker",
            body: body || "",
            url: targetUrl,
            ...data,
        },
        webpush: {
            headers: { Urgency: "high" },
            // Explicit notification block prevents Chrome from showing the origin URL
            notification: {
                title: title || "UFL Habit Tracker",
                body: body || "",
                icon: "/UFLLogo.png",
                badge: "/UFLLogo.png",
                // Routes browser click to the correct page
                // (service worker also handles this via notificationclick)
            } as any,
            fcmOptions: {
                link: targetUrl,
            },
        }
    });
    console.log("[FCM Admin] Message sent:", result);
};