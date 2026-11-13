"use client";

import { useEffect, useState } from "react";
import { TopLoader } from "@/components/ui/top-loader";
import { getAllDaarasForAdmin } from "@/lib/actions/schools";
import { Building2, Users, BookOpen, UserCheck, ShieldCheck, Calendar, ArrowRight } from "lucide-react";
import { useRouter } from "@/i18n/routing";

interface DaaraAdminItem {
    id: string;
    name: string;
    plan: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    createdAt: string | Date;
    _count: {
        talibes: number;
        users: number;
        halqas: number;
    };
}

export default function DaarasPartenairesAdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [daaras, setDaaras] = useState<DaaraAdminItem[]>([]);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            const res = await getAllDaarasForAdmin();
            if (isMounted) {
                if (res.success && res.daaras) {
                    setDaaras(res.daaras as unknown as DaaraAdminItem[]);
                    setError(null);
                } else if (res.error) {
                    setError(res.error);
                }
                setLoading(false);
            }
        })();
        return () => { isMounted = false; };
    }, []);

    if (loading) {
        return (
            <div className="p-8">
                <TopLoader />
                <p className="text-sm text-muted-foreground">Chargement des Daaras partenaires...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-6 md:p-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h1 className="text-2xl font-bold">Daaras Partenaires</h1>
                    <div role="status" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    const totalTalibes = daaras.reduce((acc, d) => acc + (d._count?.talibes || 0), 0);
    const totalHalqas = daaras.reduce((acc, d) => acc + (d._count?.halqas || 0), 0);

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-8 text-foreground pb-20">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border/50">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Console Super Administrateur</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Daaras Partenaires</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Vue consolidée des établissements enregistrés sur le réseau DigiDaara.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-card border border-border p-3 px-5 rounded-2xl flex items-center gap-3 shadow-sm">
                        <Building2 className="w-5 h-5 text-emerald-500" />
                        <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Daaras Actifs</p>
                            <p className="text-base font-black text-foreground">{daaras.length}</p>
                        </div>
                    </div>
                    <div className="bg-card border border-border p-3 px-5 rounded-2xl flex items-center gap-3 shadow-sm">
                        <Users className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Talibés Réseau</p>
                            <p className="text-base font-black text-foreground">{totalTalibes}</p>
                        </div>
                    </div>
                    <div className="bg-card border border-border p-3 px-5 rounded-2xl flex items-center gap-3 shadow-sm">
                        <BookOpen className="w-5 h-5 text-amber-500" />
                        <div>
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Halqas</p>
                            <p className="text-base font-black text-foreground">{totalHalqas}</p>
                        </div>
                    </div>
                </div>
            </header>

            {daaras.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-border/60 bg-muted/20">
                    <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="text-lg font-bold">Aucun Daara partenaire enregistré</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                        Les établissements apparaîtront ici dès leur configuration initiale.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {daaras.map((daara) => (
                        <div
                            key={daara.id}
                            className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                        {daara.plan || "STARTER"}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-snug">{daara.name}</h3>
                                    {daara.address && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{daara.address}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/40 text-center">
                                <div className="p-2 rounded-xl bg-muted/40">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Talibés</p>
                                    <p className="text-sm font-black">{daara._count?.talibes ?? 0}</p>
                                </div>
                                <div className="p-2 rounded-xl bg-muted/40">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Halqas</p>
                                    <p className="text-sm font-black">{daara._count?.halqas ?? 0}</p>
                                </div>
                                <div className="p-2 rounded-xl bg-muted/40">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Équipe</p>
                                    <p className="text-sm font-black">{daara._count?.users ?? 0}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(daara.createdAt).toLocaleDateString("fr-FR")}
                                </span>
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className="font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                    <span>Accéder</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
