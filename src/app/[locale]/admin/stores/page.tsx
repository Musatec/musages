"use client";

import { useEffect, useState } from "react";
import { TopLoader } from "@/components/ui/top-loader";
import { getUserStores, createStore, createSubStoreManager, switchStore } from "@/lib/actions/stores";
import { toast } from "sonner";
import { Building2, Plus, Users, ArrowRight, ShieldCheck, KeyRound, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function StoreManagerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ ownedStores: any[], currentStore: any, plan: string } | null>(null);

    // Form states
    const [newStoreName, setNewStoreName] = useState("");
    const [newStorePlan, setNewStorePlan] = useState<"STARTER" | "GROWTH" | "BUSINESS">("STARTER");
    
    // Auth form inside a store
    const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
    const [empName, setEmpName] = useState("");
    const [empEmail, setEmpEmail] = useState("");
    const [empPass, setEmpPass] = useState("");

    const fetchData = async () => {
        const res = await getUserStores();
        if (res.success) {
            setData(res as any);
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    const getLimits = (plan: string) => {
        if (plan === "BUSINESS") return 6;
        if (plan === "GROWTH") return 3;
        return 1;
    };

    const currentLimit = getLimits(data?.plan || "STARTER");
    const currentCount = data?.ownedStores?.length || 0;
    const canCreateMore = currentCount < currentLimit;

    useEffect(() => {
        let isMounted = true;
        (async () => {
            const res = await getUserStores();
            if (isMounted) {
                if (res.success) setData(res as any);
                else toast.error(res.error);
                setLoading(false);
            }
        })();
        return () => { isMounted = false; };
    }, []);

    const handleCreateStore = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await createStore(newStoreName);
        if (res.success) {
            toast.success(`Succursale "${newStoreName}" créée avec succès !`);
            setNewStoreName("");
            fetchData();
        } else {
            toast.error(res.error);
        }
    };

    const handleCreateManager = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeStoreId) return;
        const res = await createSubStoreManager({ 
            storeId: activeStoreId, 
            name: empName, 
            email: empEmail, 
            password: empPass 
        });
        if (res.success) {
            toast.success(`Accès Manager créé pour ${empEmail} !`);
            setEmpName(""); setEmpEmail(""); setEmpPass("");
            setActiveStoreId(null);
            fetchData();
        } else {
            toast.error(res.error);
        }
    };

    const handleSwitchStore = async (id: string, name: string) => {
        const res = await switchStore(id);
        if (res.success) {
            toast.success(`Connexion en cours à ${name}...`);
            router.push('/dashboard');
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-8 text-foreground pb-20">
            {loading && <TopLoader />}

            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border/50">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight uppercase">Centrale Réseau</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gouvernance multi-boutiques et déploiement de succursales.
                    </p>
                </div>

                <div className="bg-muted border border-border p-3 px-6 rounded-2xl flex items-center gap-4 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest opacity-60">
                            Plan {data?.plan || "STARTER"} ({currentCount}/{currentLimit})
                        </p>
                        <p className="text-xs font-bold uppercase text-foreground">
                            {canCreateMore ? `${currentLimit - currentCount} emplacement(s) libre(s)` : "Réseau à capacité maximale"}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Store List Column */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Vos Unités Opérationnelles ({data?.ownedStores?.length || 0})</h2>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {data?.ownedStores?.map((store: any) => {
                            const isCurrent = data?.currentStore?.id === store.id;
                            return (
                                <div key={store.id} className={cn(
                                    "bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden group transition-all",
                                    isCurrent ? "border-primary/40 shadow-primary/5" : "border-border"
                                )}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                    
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-border transition-colors shadow-sm",
                                                isCurrent ? "bg-primary text-primary-foreground border-transparent" : "bg-muted text-muted-foreground"
                                            )}>
                                                <Building2 className="w-6 h-6" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="text-xl font-bold uppercase tracking-tight truncate">{store.name}</h3>
                                                <p className="text-[9px] font-bold text-muted-foreground/50 font-mono italic">ID : {store.id.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-2 text-right shrink-0">
                                            <div className="px-3 py-1 bg-muted border border-border rounded-lg text-[9px] font-bold uppercase text-emerald-600 shadow-sm flex items-center gap-2">
                                                <ShieldCheck className="w-3 h-3" /> {store.plan}
                                            </div>
                                            {isCurrent && (
                                                <span className="text-[10px] font-bold uppercase text-primary animate-pulse tracking-wide">Unité de Bord Active</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 relative z-10">
                                        <button 
                                            disabled={isCurrent}
                                            onClick={() => handleSwitchStore(store.id, store.name)}
                                            className={cn(
                                                "py-3 rounded-xl flex items-center justify-center gap-3 text-xs font-bold uppercase transition-all shadow-sm",
                                                isCurrent 
                                                    ? "bg-muted/50 opacity-50 cursor-not-allowed border border-border text-muted-foreground"
                                                    : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
                                            )}
                                        >
                                            <Zap className="w-4 h-4" /> 
                                            Basculer la Session
                                        </button>

                                        <button 
                                            onClick={() => setActiveStoreId(activeStoreId === store.id ? null : store.id)}
                                            className={cn(
                                                "py-3 border rounded-xl flex items-center justify-center gap-3 text-xs font-bold uppercase transition-all shadow-sm",
                                                activeStoreId === store.id 
                                                    ? "bg-foreground text-background border-transparent" 
                                                    : "bg-card border-border text-foreground hover:bg-muted"
                                            )}
                                        >
                                            <KeyRound className="w-4 h-4" /> 
                                            Gestion Accès
                                        </button>
                                    </div>

                                    {activeStoreId === store.id && (
                                        <form onSubmit={handleCreateManager} className="mt-6 space-y-5 animate-in fade-in zoom-in-95 duration-300 bg-muted/30 p-6 rounded-2xl border border-border relative z-10 shadow-inner">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground flex items-center gap-2">Nouveau Compte Gérant</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase ml-1">Identité</label>
                                                    <input required value={empName} onChange={e=>setEmpName(e.target.value)} placeholder="Nom complet" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-xs font-bold uppercase focus:border-primary/50 outline-none" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase ml-1">Identifiant (Email)</label>
                                                    <input required type="email" value={empEmail} onChange={e=>setEmpEmail(e.target.value)} placeholder="email@boutique.sn" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-xs font-bold focus:border-primary/50 outline-none" />
                                                </div>
                                                <div className="space-y-1 col-span-1 md:col-span-2">
                                                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase ml-1">Mot de Passe Gérant</label>
                                                    <input required type="password" value={empPass} onChange={e=>setEmpPass(e.target.value)} placeholder="••••••••" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-xs font-bold focus:border-primary/50 outline-none" />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3 pt-3">
                                                <button type="button" onClick={() => setActiveStoreId(null)} className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase hover:bg-card transition-all">Annuler</button>
                                                <button type="submit" className="px-6 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold uppercase shadow-md hover:scale-105 active:scale-95 transition-all">Générer Accès</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            );
                        })}

                        <div className="p-8 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center space-y-4 opacity-50 bg-muted/10 group cursor-pointer hover:border-primary/30 transition-all">
                            <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <div className="text-center">
                                <p className="text-xs font-bold uppercase tracking-wider">Planification de Succursale</p>
                                <p className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase opacity-60">Ajouter une nouvelle implantation réseau.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Store Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Plus className="w-5 h-5 text-primary" />
                             </div>
                             <h2 className="text-xl font-bold uppercase tracking-tight">Expansion</h2>
                        </div>
                        
                        <form onSubmit={handleCreateStore} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Nom de la succursale</label>
                                <input 
                                    required 
                                    disabled={!canCreateMore}
                                    value={newStoreName}
                                    onChange={e => setNewStoreName(e.target.value)}
                                    placeholder={canCreateMore ? "Ex: Succursale Plateau" : "Limite de plan atteinte"}
                                    className="w-full bg-muted/20 border border-border rounded-xl px-5 py-3.5 text-sm font-bold uppercase focus:border-primary/50 outline-none disabled:opacity-50"
                                />
                            </div>
                            
                            {!canCreateMore && (
                                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-center space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <p className="text-[10px] font-bold text-primary uppercase">Passer au plan supérieur pour plus de succursales</p>
                                    <button type="button" className="text-[9px] font-black uppercase tracking-widest underline underline-offset-4 hover:opacity-70 transition-opacity">Consulter les tarifs</button>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={!canCreateMore}
                                className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-sm font-bold uppercase shadow-lg shadow-primary/10 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {canCreateMore ? "Déployer la Boutique" : "Capacité Atteinte"}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                        
                        <div className="mt-8 p-5 bg-muted/50 border border-border rounded-xl flex items-start gap-4">
                            <Zap className="w-5 h-5 text-primary shrink-0 mt-1" />
                            <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase opacity-70">
                                Les données par succursale sont strictement isolées. Seul le Directeur Général possède les privilèges de basculement inter-magasins.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
