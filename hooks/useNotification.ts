"use client"

import { useEffect } from "react";
import { requestNotificationPermission, onForegroundMessage } from "@/lib/firebase/firebase-messaging";

export const useNotification = () => {
  useEffect(() => {
    const init = async () => {
      const token = await requestNotificationPermission();
      if (!token) return;

      await fetch("/api/fcm-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      onForegroundMessage((payload) => {
        console.log("Foreground notification:", payload);
      });
    };

    init();
  }, []);
};