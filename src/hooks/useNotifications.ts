import { useEffect } from "react";
import notificationService from "../services/notificationService";
import { useAuth } from "../context/AuthProvider";

/**
 * Hook to initialize and handle notifications
 */
export const useNotifications = () => {
  const { token, profile } = useAuth();

  useEffect(() => {
    // Only run if user is logged in
    if (!token || !profile) return;

    notificationService.initializeNotifications(token, false);

    return () => {
      notificationService.cleanupNotifications();
    };
  }, [token, profile?.id]);
};
