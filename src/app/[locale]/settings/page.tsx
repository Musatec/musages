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
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StoreSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'taxes' | 'security'>('general');

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

    const fetchStore = useCallback(async () => {
        setLoading(true);
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
        setLoading(false);
    }, []);

    useEffect(() => { fetchStore(); }, [fetchStore]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const res = await updateStore(storeData);
        if (res.success) toast.success("Configuration mise à jour !");
        else toast.error(res.error);
        setSaving(false);
    };

    const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: LucideIcon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={cn(
                "flex items-center justify-between w-full px-5 py-4 rounded-xl text-xs font-bold transition-all",
                activeTab === id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                    : "text-muted-foreground hover:bg-muted/50"
            )}
        >
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span className="uppercase tracking-wider">{label}</span>
            </div>
            {activeTab === id && <ChevronRight className="w-4 h-4" />}
        </button>
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-8 text-foreground pb-20">
            {loading && <TopLoader />}

            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border/50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Paramètres Généraux</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configurez l'identité visuelle et les paramètres fiscaux de votre boutique.
                    </p>
                </div>

                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-xl flex items-center justify-center gap-3 text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/10"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer les Modifications
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <div className="flex flex-col gap-1">
                    <TabButton id="general" label="Identité & Contact" icon={Building2} />
                    <TabButton id="branding" label="Image de Marque" icon={Palette} />
                    <TabButton id="taxes" label="Fiscalité & Taxes" icon={Percent} />
                    <TabButton id="security" label="Sessions & Sécurité" icon={ShieldCheck} />
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 bg-card border border-border p-8 md:p-12 rounded-2xl shadow-sm relative overflow-hidden">
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
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 ml-1">Logo de l'Établissement (URL)</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        <input 
                                            value={storeData.config.logo}
                                            onChange={e => setStoreData({...storeData, config: {...storeData.config, logo: e.target.value}})}
                                            className="w-full bg-muted/20 border border-border rounded-xl px-12 py-3.5 text-xs font-bold focus:border-primary/50 outline-none"
                                            placeholder="https://votre-image.sn/logo.png"
                                        />
                                    </div>
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

                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                                 <div className="p-6 bg-muted/20 border border-border rounded-xl space-y-4">
                                     <div className="flex items-center gap-3 text-emerald-500">
                                         <ShieldCheck className="w-5 h-5" />
                                         <h3 className="text-sm font-bold uppercase tracking-wider">Sécurité des Accès</h3>
                                     </div>
                                     <p className="text-[11px] text-muted-foreground leading-relaxed font-medium uppercase tracking-tight">
                                         Toutes les sessions de gestion sont sécurisées par un chiffrement standard. Les logs de connexion sont audités quotidiennement.
                                     </p>
                                 </div>

                                 <button type="button" className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                                     Initialiser la Clé de Chiffrement (Action Critique)
                                 </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
