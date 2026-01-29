"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSupabase } from "./supabase-provider";
import { ShieldAlert, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemSettings {
    maintenance_mode?: boolean;
    broadcast_message?: string;
}

export function SystemGuardian({ children }: { children: React.ReactNode }) {
    const { isAdmin } = useSupabase();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [broadcast, setBroadcast] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch global settings from admin profile
        const fetchSystemStatus = async () => {
            try {
                // We find an admin profile to get global settings
                const { data, error } = await supabase
                    .from('profiles')
                    .select('settings')
                    .eq('role', 'admin')
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    console.warn("Guardian: Could not fetch system settings (RLS?)", error.message);
                    return;
                }

                if (data?.settings) {
                    const settings = data.settings as unknown as SystemSettings;
                    setMaintenanceMode(settings.maintenance_mode || false);
                    setBroadcast(settings.broadcast_message || "");
                }
            } catch (err) {
                console.error("Guardian check failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSystemStatus();

        // Optional: Realtime subscription to admin settings
        const channel = supabase
            .channel('system_changes')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: "role=eq.admin"
            }, (payload) => {
                const settings = (payload.new as { settings?: SystemSettings }).settings;
                if (settings) {
                    setMaintenanceMode(settings.maintenance_mode || false);
                    setBroadcast(settings.broadcast_message || "");
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading) return children;

    // IF MAINTENANCE MODE IS ON AND USER IS NOT ADMIN
    if (maintenanceMode && !isAdmin) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative inline-block">
                        <div className="w-24 h-24 bg-orange-500/10 rounded-[2rem] flex items-center justify-center border border-orange-500/20">
                            <ShieldAlert className="w-12 h-12 text-orange-500 animate-pulse" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-black border border-white/10 rounded-full flex items-center justify-center">
                            <Zap className="w-4 h-4 text-orange-500" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black tracking-tighter italic text-white">
                            SANCTUAIRE <span className="text-orange-500">VERROUILLÉ.</span>
                        </h1>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Le Mentor effectue actuellement des rituels de maintenance sur le noyau de l&apos;OS.
                            Veuillez patienter pendant que nous renforçons les fondations de MINDOS.
                        </p>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3">
                        <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Optimisation en cours...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* BROADCAST BANNER */}
            {broadcast && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-[#F97316] to-amber-500 py-1.5 px-4 text-center overflow-hidden animate-in slide-in-from-top duration-500 shadow-2xl">
                    <div className="absolute inset-0 bg-white/10 animate-pulse" />
                    <div className="relative z-10 flex items-center justify-center gap-3">
                        <Zap className="w-3.5 h-3.5 text-white" />
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{broadcast}</p>
                        <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                </div>
            )}

            <div className={cn("flex-1 flex flex-col", broadcast && "pt-8")}>
                {children}
            </div>
        </>
    );
}
