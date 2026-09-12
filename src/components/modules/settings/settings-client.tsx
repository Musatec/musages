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
    slogan: school.config?.slogan || "",
    gradingSystem: school.config?.gradingSystem || "BASE_20_COEF",
    averageBase: school.config?.averageBase || 20,
    reportHeaderLeft: school.config?.reportHeaderLeft || "",
    reportHeaderRight: school.config?.reportHeaderRight || ""
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
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Paramètres de l'Établissement</h1>
        <p className="text-sm text-muted-foreground">Ces informations apparaîtront sur les bulletins et reçus.</p>
      </div>

      <div className="bg-card border border-border/50 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] shadow-sm">
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
                className="w-full bg-background border border-border/50 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50"
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

          <div className="border-t border-border/50 pt-6 mt-8">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4">Système de Notation & Bulletins</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Système d'évaluation</label>
                <select
                  value={formData.gradingSystem}
                  onChange={(e) => setFormData({...formData, gradingSystem: e.target.value})}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                >
                  <option value="BASE_20_COEF">Classique (Moyenne sur 20 & Coefficients)</option>
                  <option value="SUM_OF_MAX_GRADES">Primaire (Somme des notes brutes)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">Le mode Primaire additionne les notes sans les ramener sur 20.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Base de la moyenne</label>
                <input 
                  type="number"
                  value={formData.averageBase}
                  onChange={(e) => setFormData({...formData, averageBase: Number(e.target.value)})}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">La moyenne finale sera affichée sur cette base (ex: 10, 20).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">En-tête Gauche (IA, IEF...)</label>
                <textarea
                  value={formData.reportHeaderLeft}
                  onChange={(e) => setFormData({...formData, reportHeaderLeft: e.target.value})}
                  placeholder="IA : DAKAR&#10;IEF : DAKAR"
                  rows={3}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">En-tête Droite (Optionnel)</label>
                <textarea
                  value={formData.reportHeaderRight}
                  onChange={(e) => setFormData({...formData, reportHeaderRight: e.target.value})}
                  placeholder="Informations supplémentaires..."
                  rows={3}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
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
