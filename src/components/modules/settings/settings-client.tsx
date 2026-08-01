"use client";

import { useState } from "react";
import { Building2, Save, MapPin, Phone, Mail, Quote } from "lucide-react";
import { updateSchoolSettings } from "@/lib/actions/settings";
import { toast } from "sonner";

interface SettingsClientProps {
  school: any;
}

export function SettingsClient({ school }: SettingsClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: school.name || "",
    address: school.address || "",
    phone: school.phone || "",
    email: school.email || "",
    ninea: school.ninea || "",
    slogan: school.config?.slogan || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.loading("Sauvegarde en cours...");

    const res = await updateSchoolSettings(formData);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Paramètres mis à jour avec succès !");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic">Paramètres de l'Établissement</h1>
        <p className="text-sm text-muted-foreground">Ces informations apparaîtront sur les bulletins et reçus.</p>
      </div>

      <div className="bg-card border border-border/50 p-6 md:p-8 rounded-[2rem] shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nom de l'école / Établissement</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input 
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-background border border-border/50 rounded-xl pl-12 pr-4 py-3 text-sm font-bold uppercase focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Slogan / Devise (Optionnel)</label>
            <div className="relative">
              <Quote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input 
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData({...formData, slogan: e.target.value})}
                placeholder="Ex: Excellence et Rigueur"
                className="w-full bg-background border border-border/50 rounded-xl pl-12 pr-4 py-3 text-sm italic focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Adresse physique</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input 
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-background border border-border/50 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Téléphone de l'administration</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input 
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-background border border-border/50 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Email de contact</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-background border border-border/50 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">NINEA / Agrément (Optionnel)</label>
              <input 
                type="text"
                value={formData.ninea}
                onChange={(e) => setFormData({...formData, ninea: e.target.value})}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border/50 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-black font-black uppercase text-[11px] px-8 py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 tracking-widest disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
