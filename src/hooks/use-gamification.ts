"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useSupabase } from "@/components/providers/supabase-provider";
import { toast } from "sonner";

export interface GamificationStats {
    current_xp: number;
    level: number;
    current_streak: number;
    last_active_date: string;
}

/**
 * Hook Global de Gamification
 * Gère l'XP, les niveaux et les streaks en synchronisation avec Supabase.
 */
export function useGamification() {
    const { user } = useSupabase();
    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("current_xp, level, current_streak, last_active_date")
                .eq("id", user.id)
                .single();

            if (error) throw error;
            setStats(data as GamificationStats);
        } catch (error) {
            console.error("Error fetching gamification stats:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user, fetchStats]);

    /**
     * Ajoute de l'XP à l'utilisateur
     * @param amount Quantité d'XP à ajouter
     * @param reason Message à afficher dans le toast (ex: "Mission accomplie")
     */
    const addXp = async (amount: number, reason?: string) => {
        if (!user || !stats) return;

        // Calcul optimiste du nouveau niveau (500 XP par niveau)
        const oldStats = { ...stats };
        const newXp = stats.current_xp + amount;
        const newLevel = Math.floor(newXp / 500) + 1;

        // Mise à jour locale immédiate pour réactivité
        setStats({
            ...stats,
            current_xp: newXp,
            level: newLevel
        });

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    current_xp: newXp,
                    updated_at: new Date().toISOString()
                })
                .eq("id", user.id);

            if (error) throw error;

            // Feedback visuel
            if (newLevel > oldStats.level) {
                toast.success(`NIVEAU SUPÉRIEUR ! 🚀`, {
                    description: `Félicitations Mentor, vous avez atteint le niveau ${newLevel} !`,
                    duration: 5000,
                });
            } else if (reason) {
                toast.success(`+${amount} XP : ${reason} ! ✨`);
            }
        } catch (error) {
            console.error("Error updating XP:", error);
            setStats(oldStats); // Rollback en cas d'erreur
            toast.error("Échec de la synchronisation de l'XP");
        }
    };

    /**
     * Met à jour le streak d'activité
     * Appelle une fonction RPC Supabase (doit être créée en SQL)
     */
    const updateStreak = async () => {
        if (!user) return;
        try {
            // On utilise une RPC pour déléguer la logique de date au serveur SQL
            const { error } = await supabase.rpc("update_user_streak", { user_id_param: user.id });
            if (error) throw error;
            await fetchStats();
        } catch (error) {
            console.error("Error updating streak:", error);
        }
    };

    return {
        stats,
        loading,
        addXp,
        updateStreak,
        refresh: fetchStats
    };
}
