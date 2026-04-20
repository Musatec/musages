"use client";

import { useEffect, useState, useCallback } from "react";
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
import { EliteMetricCard } from "@/components/ui/metric-card";

// Modules
import { AccountsTab } from "@/components/social/accounts-tab";
import { PlannerTab } from "@/components/social/planner-tab";
import { GoalsTab } from "@/components/social/goals-tab";
import { ElitePageHeader } from "@/components/ui/page-header";

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

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            const { data: groupsData } = await supabase.from('social_groups')
                .select('*')
                .eq('user_id', user.id)
                .order('name');
            setGroups((groupsData as SocialGroup[]) || []);

            const { data: profilesData } = await supabase.from('social_profiles')
                .select('*')
                .eq('user_id', user.id);
            setProfiles((profilesData as SocialProfile[]) || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'planner') setActiveTab('planner');
    }, []);

    useEffect(() => {
        if (user) fetchData();
    }, [user, fetchData]);

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
            <ElitePageHeader 
                title="Croissance & Engagement."
                subtitle="Stratégie Digitale"
                description="Pilotez votre présence multi-plateforme, planifiez vos publications et suivez l'évolution de votre audience."
                actions={
                    activeTab === "accounts" && (
                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder={t('filter_placeholder')}
                                className="w-full bg-secondary/30 border border-border/50 rounded-xl pl-10 pr-4 py-2 text-[10px] text-foreground focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/50 font-bold"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )
                }
            />

            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="flex flex-col gap-6">
                    {/* --- SOCIAL STRATEGY HUB (Elite SaaS) --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <EliteMetricCard 
                            label="Réseaux" 
                            value={groups.length} 
                            icon={Share2} 
                            variant="blue"
                        />
                        <EliteMetricCard 
                            label="Profils" 
                            value={profiles.length} 
                            icon={Users} 
                            variant="purple"
                        />
                        <EliteMetricCard 
                            label="Planning" 
                            value="Actif" 
                            icon={Layout} 
                            variant="amber"
                        />
                        <EliteMetricCard 
                            label="Croissance" 
                            value="85%" 
                            icon={Target} 
                            variant="emerald"
                        />
                    </div>

                    {activeTab === "accounts" && (
                        <div className="relative group w-full max-w-[300px] mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder={t('filter_placeholder')}
                                className="w-full bg-secondary/30 border border-border/50 rounded-xl pl-10 pr-4 py-2 text-[10px] text-foreground focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/50 font-bold"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Custom Tabs Navigation */}
                <div className="grid grid-cols-3 gap-1 bg-card/50 p-1 rounded-xl border border-border/50 backdrop-blur-xl">
                    {[
                        { id: "accounts", label: "COMPTES", icon: Users },
                        { id: "planner", label: "PLANNING", icon: Layout },
                        { id: "goals", label: "OBJECTIFS", icon: Target },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ActiveTab)}
                            className={cn(
                                "flex flex-col xs:flex-row items-center justify-center gap-1.5 py-2 md:py-3 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-tighter xs:tracking-widest transition-all",
                                activeTab === tab.id
                                    ? "bg-primary text-foreground shadow-lg shadow-orange-900/20"
                                    : "text-muted-foreground hover:text-zinc-300"
                            )}
                        >
                            <tab.icon className={cn("w-3 h-3 md:w-3.5 md:h-3.5", activeTab === tab.id ? "text-foreground" : "text-muted-foreground")} />
                            <span className="truncate">{tab.label}</span>
                        </button>
                    ))}
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
