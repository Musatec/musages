"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

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

    // Redirection automatique si non connecté (Fallback client-side au Middleware)
    useEffect(() => {
        const isAuthPage = pathname.includes('/login') || pathname.includes('/auth');
        const isHomePage = pathname === '/' || /^\/(en|fr)\/?$/.test(pathname);

        if (!isLoading && !user && !isAuthPage && !isHomePage) {
            router.push('/login');
        }
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

    // TRÈS IMPORTANT : Empêche l'application de rendre des composants qui font des requêtes Supabase
    // avant que l'utilisateur ne soit chargé/vérifié.
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-[#F97316] animate-spin" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] animate-pulse">Initialisation MINDOS...</p>
            </div>
        );
    }

    return (
        <SupabaseContext.Provider value={value}>
            {children}
        </SupabaseContext.Provider>
    );
}
