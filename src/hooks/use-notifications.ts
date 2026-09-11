"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/actions/notifications";

export function useNotifications(userId: string | undefined) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        const data = await getNotifications();
        setNotifications(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!userId) return;

        let isMounted = true;
        getNotifications().then((data) => {
            if (isMounted) {
                setNotifications(data);
                setLoading(false);
            }
        });

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`notifications-${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "Notification",
                    filter: `userId=eq.${userId}`,
                },
                (payload) => {
                    setNotifications((prev) => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return {
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications
    };
}
