"use client";

import { useEffect, useState } from "react";
import { getSuppliers, createSupplier } from "@/lib/actions/procurement";
import { TopLoader } from "@/components/ui/top-loader";
import { toast } from "sonner";
import { Truck, Plus, User, Phone, Mail, MapPin, Building2, Search, Loader2, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SuppliersPage() {
    const [loading, setLoading] = useState(true);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        name: "",
        contactName: "",
        email: "",
        phone: "",
        address: ""
    });

    const fetchData = async () => {
        setLoading(true);
        const res = await getSuppliers();
        if (res.success) setSuppliers(res.suppliers || []);
        else toast.error(res.error);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await createSupplier(formData);
        if (res.success) {
            toast.success("Fournisseur enregistré !");
            setIsAdding(false);
            setFormData({ name: "", contactName: "", email: "", phone: "", address: "" });
            fetchData();
        } else {
            toast.error(res.error);
        }
    };

    const filteredSuppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-8 text-foreground pb-20">
            {loading && <TopLoader />}

            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border/50">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Gestion des Fournisseurs</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gérez vos partenaires logistiques et suivez les flux d'approvisionnement.
                    </p>
                </div>
                
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-xl flex items-center justify-center gap-3 text-sm font-bold shadow-md shadow-primary/10 hover:bg-primary/90 active:scale-95 transition-all"
                >
                    {isAdding ? "Annuler l'ajout" : <><Plus className="w-5 h-5" /> Ajouter un Fournisseur</>}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Addition Form (If active) */}
                {isAdding && (
                    <div className="lg:col-span-12 animate-in zoom-in-95 duration-300">
                        <form onSubmit={handleSubmit} className="bg-card border border-border p-8 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                            
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Raison Sociale</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="Ex: SENEGAL DISTRIB" className="w-full bg-muted/20 border border-border rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold focus:border-primary/50 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Référent / Contact</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    <input value={formData.contactName} onChange={e=>setFormData({...formData, contactName: e.target.value})} placeholder="Ex: Issa Diop" className="w-full bg-muted/20 border border-border rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold focus:border-primary/50 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Téléphone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    <input value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} placeholder="+221 ..." className="w-full bg-muted/20 border border-border rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold focus:border-primary/50 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Email Officiel</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} placeholder="contact@fournisseur.sn" className="w-full bg-muted/20 border border-border rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold focus:border-primary/50 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Localisation / Siège</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-muted-foreground/40" />
                                    <textarea value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} placeholder="Km 5, Boulevard du Centenaire..." className="w-full bg-muted/20 border border-border rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold focus:border-primary/50 outline-none min-h-[58px]" />
                                </div>
                            </div>

                            <div className="lg:col-span-3 flex justify-end pt-4 border-t border-border mt-2">
                                <button type="submit" className="bg-foreground text-background px-10 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md">
                                    Enregistrer le partenaire
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List and Search */}
                <div className="lg:col-span-12 space-y-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                        <input 
                            value={searchTerm}
                            onChange={e=>setSearchTerm(e.target.value)}
                            placeholder="Rechercher un partenaire logistique..." 
                            className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:ring-1 focus:ring-primary/20 shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSuppliers.map((s) => (
                            <div key={s.id} className="bg-card border border-border p-6 rounded-2xl hover:border-primary/30 transition-all group relative overflow-hidden shadow-sm">
                                 <div className="flex justify-between items-start mb-6">
                                     <div className="w-12 h-12 bg-muted border border-border rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors group-hover:text-primary-foreground group-hover:border-transparent shadow-sm">
                                         <Truck className="w-6 h-6" />
                                     </div>
                                     <span className="text-[10px] font-bold uppercase text-muted-foreground/40 font-mono tracking-tighter">REF: {s.id.slice(-6).toUpperCase()}</span>
                                 </div>
                                 
                                 <div className="space-y-4">
                                     <div>
                                         <h3 className="text-xl font-bold uppercase tracking-tighter truncate">{s.name}</h3>
                                         <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">{s.contactName || "Référent inconnu"}</p>
                                     </div>

                                     <div className="space-y-2 pt-4 border-t border-border">
                                         <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-bold uppercase tracking-tight">
                                             <Phone className="w-3.5 h-3.5 text-primary/40" /> {s.phone || "Non renseigné"}
                                         </div>
                                         <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-bold lowercase truncate">
                                             <Mail className="w-3.5 h-3.5 text-primary/40" /> {s.email || "Non renseigné"}
                                         </div>
                                         <div className="flex items-start gap-3 text-[11px] text-muted-foreground font-bold uppercase tracking-tight">
                                             <MapPin className="w-3.5 h-3.5 text-primary/40 shrink-0 mt-0.5" /> <span className="line-clamp-2">{s.address || "Aucun siège défini"}</span>
                                         </div>
                                     </div>
                                     
                                     <div className="pt-4 flex justify-between items-center">
                                         <div className="text-[9px] font-bold uppercase text-emerald-600 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                             Partenaire Actif
                                         </div>
                                         <div className="text-[10px] font-bold uppercase text-foreground flex items-center gap-2">
                                             Flots : <span className="text-primary">{s._count?.purchases || 0}</span>
                                         </div>
                                     </div>
                                 </div>
                            </div>
                        ))}

                        {filteredSuppliers.length === 0 && !loading && (
                            <div className="col-span-full py-20 text-center space-y-4 opacity-30 border-2 border-dashed border-border rounded-3xl">
                                <Truck className="w-10 h-10 mx-auto text-muted-foreground" />
                                <p className="text-xs font-bold uppercase tracking-widest font-mono">Aucune entité logistique enregistrée</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
