"use client";

import { useEffect, useState } from "react";
import {
    Share2,
    Search,
    Layout,
    Target,
    Users,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import { NewNetworkSheet } from "@/components/social/new-network-sheet";
import { useSupabase } from "@/components/providers/supabase-provider";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Modules
import { AccountsTab } from "@/components/social/accounts-tab";
import { PlannerTab } from "@/components/social/planner-tab";
import { GoalsTab } from "@/components/social/goals-tab";

type SocialGroup = Database['public']['Tables']['social_groups']['Row'] & { banner_url?: string; website_url?: string };
type SocialProfile = Database['public']['Tables']['social_profiles']['Row'] & { status?: string; tags?: string[] };

type ActiveTab = "accounts" | "planner" | "goals";

export default function SocialPage() {
    const { user } = useSupabase();
    const t = useTranslations("Growth");
    const [groups, setGroups] = useState<SocialGroup[]>([]);
    const [profiles, setProfiles] = useState<SocialProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<ActiveTab>("accounts");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'planner') setActiveTab('planner');
    }, []);

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        try {
            const { data: groupsData } = await supabase.from('social_groups')
                .select('*')
                .eq('user_id', user.id)
                .order('name');
            setGroups((groupsData as any) || []);

            const { data: profilesData } = await supabase.from('social_profiles')
                .select('*')
                .eq('user_id', user.id);
            setProfiles((profilesData as any) || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredGroups = groups.filter(group => {
        if (!searchQuery) return true;
        const groupMatches = group.name.toLowerCase().includes(searchQuery.toLowerCase());
        const hasMatchingProfiles = profiles.some(p =>
            p.group_id === group.id && p.platform.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return groupMatches || hasMatchingProfiles;
    });

    if (loading && groups.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 min-h-screen space-y-8 md:space-y-12 bg-background selection:bg-primary/30">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-8 py-2 md:py-4 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="space-y-4 md:space-y-6 w-full md:w-auto">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-card border border-border flex items-center justify-center shadow-xl shadow-black/20">
                            <Share2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">
                                RÉSEAUX <span className="text-primary italic">SOCIAUX</span>
                            </h1>
                            <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1">{t('subtitle')}</p>
                        </div>
                    </div>

                    {/* Custom Tabs Navigation */}
                    <div className="flex items-center gap-1 md:gap-2 bg-card/50 p-1 md:p-1.5 rounded-2xl border border-border w-full md:w-fit backdrop-blur-xl shadow-2xl overflow-x-auto no-scrollbar">
                        {[
                            { id: "accounts", label: t('tab_accounts'), icon: Users },
                            { id: "planner", label: t('tab_planner'), icon: Layout },
                            { id: "goals", label: t('tab_goals'), icon: Target },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as ActiveTab)}
                                className={cn(
                                    "flex items-center gap-2.5 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === tab.id
                                        ? "bg-orange-500 text-white shadow-xl shadow-orange-500/20 scale-105"
                                        : "text-zinc-400 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white border border-transparent"
                                )}
                            >
                                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-primary" : "text-card-foreground/30")} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-5">
                    {activeTab === "accounts" && (
                        <div className="relative max-w-sm group animate-in fade-in zoom-in duration-500">
                            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder={t('filter_placeholder')}
                                className="w-80 bg-card border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm text-foreground focus:border-primary/50 focus:bg-accent/20 outline-none transition-all placeholder:text-muted-foreground shadow-2xl shadow-black/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                    <NewNetworkSheet onSuccess={fetchData} />
                </div>
            </div>

            {/* Content Rendering based on Tab */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        {activeTab === "accounts" && (
                            <AccountsTab
                                groups={filteredGroups}
                                profiles={profiles}
                                fetchData={fetchData}
                                setProfiles={setProfiles}
                            />
                        )}
                        {activeTab === "planner" && <PlannerTab />}
                        {activeTab === "goals" && <GoalsTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
