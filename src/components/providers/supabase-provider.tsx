"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "@/i18n/routing";
import { DaaraLoadingScreen } from "@/components/ui/loading-screen";

type SupabaseContextType = {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextType>({
    session: null,
    user: null,
    isLoading: true,
    isAdmin: false,
    signOut: async () => { },
});

export const useSupabase = () => useContext(SupabaseContext);
export const useAuth = () => useContext(SupabaseContext);

export default function SupabaseProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // 1. Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
            } catch (error) {
                console.error("Error getting session:", error);
            } finally {
                setIsLoading(false);
            }
        };

        getInitialSession();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setIsLoading(false);

                if (event === 'SIGNED_IN') {
                    router.refresh();
                }
                if (event === 'SIGNED_OUT') {
                    router.refresh();
                    router.push('/');
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    // Redirection automatique désactivée : Le Middleware de Next-Auth gère désormais la protection.
    useEffect(() => {
        // Logique de redirection locale supprimée pour éviter les conflits avec Next-Auth.
    }, [isLoading, user, pathname, router]);

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const isAdmin = user?.email === "musatech0000@gmail.com";

    const value = {
        session,
        user,
        isLoading,
        isAdmin,
        signOut
    };

    return (
        <SupabaseContext.Provider value={value}>
            {isLoading ? (
                <DaaraLoadingScreen message="Initialisation de l'Espace Daara..." />
            ) : (
                children
            )}
        </SupabaseContext.Provider>
    );
}
