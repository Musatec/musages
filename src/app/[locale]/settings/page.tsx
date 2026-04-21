"use client";

import { useEffect, useState, useCallback } from "react";
import { getStore, updateStore } from "@/lib/actions/store";
import { TopLoader } from "@/components/ui/top-loader";
import { toast } from "sonner";
import { 
    Settings, 
    Building2, 
    MapPin, 
    Palette, 
    ShieldCheck, 
    Save, 
    Loader2, 
    Percent, 
    Image as ImageIcon,
    LucideIcon,
    ChevronRight,
    CreditCard,
    Zap,
    Crown,
    History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSubscriptionData, initiatePayment } from "@/lib/actions/subscription";
import { EliteMetricCard } from "@/components/ui/metric-card";
import { ElitePageHeader } from "@/components/ui/page-header";
import { ImageUpload } from "@/components/ui/image-upload";

interface TabButtonProps {
    id: string;
    activeTab: string;
    setActiveTab: (id: any) => void;
    label: string;
    icon: LucideIcon;
}

const TabButton = ({ id, activeTab, setActiveTab, label, icon: Icon }: TabButtonProps) => (
    <button
        onClick={() => setActiveTab(id)}
        className={cn(
            "flex items-center justify-between w-auto lg:w-full px-5 py-3 lg:py-4 rounded-xl text-[10px] lg:text-xs font-bold transition-all whitespace-nowrap lg:whitespace-normal",
            activeTab === id 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                : "text-muted-foreground hover:bg-muted/50"
        )}
    >
        <div className="flex items-center gap-3">
            <Icon className="w-4 h-4" />
            <span className="uppercase tracking-wider">{label}</span>
        </div>
        {activeTab === id && <ChevronRight className="hidden lg:block w-4 h-4" />}
    </button>
);

export default function StoreSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'taxes' | 'security' | 'subscription'>('subscription');

    // Store State
    const [storeData, setStoreData] = useState({
        name: "",
        address: "",
        config: {
            logo: "",
            primaryColor: "#f97316",
            vatRate: 18,
            currency: "FCFA",
            whatsapp: "",
            email: ""
        }
    });

    const [subData, setSubData] = useState<any>(null);

    const fetchSubscription = useCallback(async () => {
        const data = await getSubscriptionData();
        setSubData(data);
    }, []);

    const fetchStore = useCallback(async () => {
        const data = await getStore() as any;
        if (data) {
            setStoreData({
                name: data.name || "",
                address: data.address || "",
                config: {
                    logo: data.config?.logo || "",
                    primaryColor: data.config?.primaryColor || "#f97316",
                    vatRate: data.config?.vatRate || 18,
                    currency: data.config?.currency || "FCFA",
                    whatsapp: data.config?.whatsapp || "",
                    email: data.config?.email || ""
                }
            });
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            if (isMounted) setLoading(true);
            await Promise.all([fetchStore(), fetchSubscription()]);
            if (isMounted) setLoading(false);
        };
        init();
        return () => { isMounted = false; };
    }, [fetchStore, fetchSubscription]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const res = await updateStore(storeData);
        if (res.success) toast.success("Configuration mise à jour !");
        else toast.error(res.error);
        setSaving(false);
    };


    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-8 text-foreground pb-20">
            {loading && <TopLoader />}

            <ElitePageHeader 
                title="Configuration & Profil."
                subtitle="Système de Gestion"
                description="Personnalisez votre expérience, gérez votre abonnement et configurez les préférences de votre établissement."
                actions={
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Enregistrer
                    </button>
                }
            />

            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
                {/* Navigation - Horizontal Scroll on Mobile, Sidebar on LG */}
                <div className="flex lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0 no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0">
                    <TabButton id="general" activeTab={activeTab} setActiveTab={setActiveTab} label="Identité" icon={Building2} />
                    <TabButton id="branding" activeTab={activeTab} setActiveTab={setActiveTab} label="Branding" icon={Palette} />
                    <TabButton id="taxes" activeTab={activeTab} setActiveTab={setActiveTab} label="Fiscalité" icon={Percent} />
                    <TabButton id="security" activeTab={activeTab} setActiveTab={setActiveTab} label="Sécurité" icon={ShieldCheck} />
                    <TabButton id="subscription" activeTab={activeTab} setActiveTab={setActiveTab} label="Abonnement" icon={CreditCard} />
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 bg-card border border-border p-6 md:p-12 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                    
                    <form onSubmit={handleSave} className="space-y-8">
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">Nom de l'enseigne</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        <input 
                                            value={storeData.name}
                                            onChange={e => setStoreData({...storeData, name: e.target.value})}
                                            className="w-full bg-muted/20 border border-border rounded-xl px-12 py-3.5 text-sm font-bold focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/20"
                                            placeholder="Ex: Boutique ELITE Dakar"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">Siège Social / Adresse</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        <input 
                                            value={storeData.address}
                                            onChange={e => setStoreData({...storeData, address: e.target.value})}
                                            className="w-full bg-muted/20 border border-border rounded-xl px-12 py-3.5 text-sm font-bold focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/20"
                                            placeholder="Ex: Plateau, Rue 12 x 15..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">WhatsApp Business</label>
                                        <input 
                                            value={storeData.config.whatsapp}
                                            onChange={e => setStoreData({...storeData, config: {...storeData.config, whatsapp: e.target.value}})}
                                            className="w-full bg-muted/20 border border-border rounded-xl px-5 py-3.5 text-sm font-bold focus:border-primary/50 outline-none"
                                            placeholder="+221 ..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">Email Officiel</label>
                                        <input 
                                            value={storeData.config.email}
                                            onChange={e => setStoreData({...storeData, config: {...storeData.config, email: e.target.value}})}
                                            className="w-full bg-muted/20 border border-border rounded-xl px-5 py-3.5 text-sm font-bold focus:border-primary/50 outline-none"
                                            placeholder="contact@boutique.sn"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'branding' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                                <div className="space-y-4">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">Logo de l'Établissement</label>
                                    <ImageUpload 
                                        value={storeData.config.logo}
                                        onChange={url => setStoreData({...storeData, config: {...storeData.config, logo: url}})}
                                        className="mt-2"
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">Ce logo sera affiché sur vos factures, tickets de caisse et sur l'interface de connexion.</p>
                                </div>

                                <div className="p-6 bg-muted/20 rounded-2xl border border-border space-y-4">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">Couleur d'Identité Principale</label>
                                    <div className="flex items-center gap-6">
                                        <input 
                                            type="color"
                                            value={storeData.config.primaryColor}
                                            onChange={e => setStoreData({...storeData, config: {...storeData.config, primaryColor: e.target.value}})}
                                            className="w-16 h-16 rounded-xl border border-border cursor-pointer overflow-hidden bg-transparent"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{storeData.config.primaryColor.toUpperCase()}</p>
                                            <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wide">Utilisée pour les boutons, accents et graphiques.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'taxes' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                                <div className="p-8 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-primary">Taux de TVA Standard</h3>
                                        <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-tight">Appliqué automatiquement aux tickets de caisse.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="number"
                                            value={storeData.config.vatRate}
                                            onChange={e => setStoreData({...storeData, config: {...storeData.config, vatRate: Number(e.target.value)}})}
                                            className="w-20 bg-muted/30 border border-border rounded-xl py-3 text-center text-xl font-bold outline-none focus:border-primary"
                                        />
                                        <span className="text-xl font-bold text-primary">%</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">Devise d'Exploitation</label>
                                    <select 
                                        value={storeData.config.currency}
                                        onChange={e => setStoreData({...storeData, config: {...storeData.config, currency: e.target.value}})}
                                        className="w-full bg-muted/20 border border-border rounded-xl px-5 py-4 text-sm font-bold outline-none appearance-none focus:border-primary/50"
                                    >
                                        <option value="FCFA">Franc CFA (XOF)</option>
                                        <option value="EUR">Euro (€)</option>
                                        <option value="USD">Dollar ($)</option>
                                        <option value="GNF">Franc Guinéen</option>
                                    </select>
                                </div>
                            </div>
                        )}

                         {activeTab === 'subscription' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                                {/* --- SUBSCRIPTION METRICS (Elite SaaS) --- */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <EliteMetricCard 
                                        label="Plan Actuel" 
                                        value={subData?.plan || "GRATUIT"} 
                                        icon={Crown} 
                                        variant="blue"
                                        sub={subData?.subscriptionStatus}
                                    />
                                    <EliteMetricCard 
                                        label="Échéance" 
                                        value={subData?.daysRemaining !== undefined ? `${subData.daysRemaining} Jours` : "ILLIMITÉ"} 
                                        icon={Zap} 
                                        variant={subData?.daysRemaining <= 3 ? "red" : "amber"}
                                        sub="Temps restant"
                                    />
                                    <EliteMetricCard 
                                        label="Transactions" 
                                        value={subData?.payments?.length || 0} 
                                        icon={History} 
                                        variant="purple"
                                        sub="Historique licence"
                                    />
                                </div>

                                <div className="p-8 bg-primary/10 border border-primary/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                                    <button 
                                        type="button"
                                        onClick={async () => {
                                            const promise = initiatePayment(subData?.plan || "STARTER");
                                            
                                            toast.promise(promise, {
                                                loading: 'Initialisation du paiement...',
                                                success: (res) => {
                                                    if (res.success && res.url) {
                                                        window.location.assign(res.url);
                                                        return "Redirection...";
                                                    }
                                                    throw new Error(res.error || "Erreur inconnue");
                                                },
                                                error: (err) => `Erreur : ${err.message}`
                                            });
                                        }}
                                        className="bg-primary text-black px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full md:w-auto italic"
                                    >
                                        Payer ma Licence (PayTech)
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Historique des Transactions</h4>
                                    <div className="bg-muted/10 border border-border rounded-2xl overflow-hidden">
                                        {subData?.payments?.length > 0 ? (
                                            <table className="w-full text-left text-[10px] uppercase font-bold">
                                                <thead className="bg-muted/20 border-b border-border text-muted-foreground/40 font-black">
                                                    <tr>
                                                        <th className="px-6 py-4">Date</th>
                                                        <th className="px-6 py-4">Référence</th>
                                                        <th className="px-6 py-4">Montant</th>
                                                        <th className="px-6 py-4 text-right">Statut</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/50">
                                                    {subData?.payments.map((p: any) => (
                                                        <tr key={p.id}>
                                                            <td className="px-6 py-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                                                            <td className="px-6 py-4 font-mono text-muted-foreground tracking-tighter">{p.id}</td>
                                                            <td className="px-6 py-4 text-primary italic">{p.amount} F</td>
                                                            <td className="px-6 py-4 text-right"><span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px]">{p.status}</span></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="p-12 text-center space-y-2 opacity-30">
                                                <History className="w-8 h-8 mx-auto" strokeWidth={1} />
                                                <p className="text-[9px] font-black tracking-widest italic">Aucune transaction enregistrée</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
