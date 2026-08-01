"use client";

import { useState, useEffect } from "react";
import { createSchool, createClass } from "@/lib/actions/school";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
    GraduationCap, ArrowRight, Loader2, CheckCircle2, 
    ShieldCheck, Sparkles, BookOpen, Trash2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InitialClass {
    name: string;
    monthlyFee: string;
}

export function StoreOnboarding() {
  const { data: session, update } = useSession();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [ninea, setNinea] = useState(""); // NINEA Optionnel
  const [initialClasses, setInitialClasses] = useState<InitialClass[]>([
      { name: "CM2 A", monthlyFee: "25000" },
      { name: "3ème B", monthlyFee: "35000" }
  ]);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const addInitialClass = () => setInitialClasses([...initialClasses, { name: "", monthlyFee: "" }]);
  const removeInitialClass = (index: number) => setInitialClasses(initialClasses.filter((_, i) => i !== index));
  const updateInitialClass = (index: number, field: keyof InitialClass, value: string) => {
      const newClasses = [...initialClasses];
      newClasses[index][field] = value;
      setInitialClasses(newClasses);
  };

  const handleSubmit = async () => {
    if (!name) return toast.error("Le nom de l'établissement est requis");

    setLoading(true);
    const result = await createSchool({ 
        name, 
        address, 
        phone,
        ninea: ninea || undefined
    });

    if (result.success && result.school) {
      const validClasses = initialClasses.filter(c => c.name && c.monthlyFee);
      if (validClasses.length > 0) {
          for (const cls of validClasses) {
              await createClass({
                  name: cls.name,
                  monthlyFee: Number(cls.monthlyFee),
              });
          }
      }

      toast.success("Votre Établissement est configuré ! ✨");
      
      await update({
        user: {
          schoolId: result.school.id,
          role: "DIRECTEUR"
        }
      });

      router.push("/dashboard");
    } else {
      toast.error(result.error || "Une erreur est survenue lors de la création.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505] overflow-hidden">
      <div className="fixed inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] opacity-10" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px] opacity-10" />
      </div>

      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full relative z-10"
      >
        <div className="bg-[#0A0A0B]/80 backdrop-blur-3xl border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          
          <div className="flex items-center gap-1.5 mb-8">
              {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-700",
                        step >= s ? "bg-primary shadow-[0_0_5px_rgba(249,115,22,0.3)]" : "bg-white/5"
                    )} 
                  />
              ))}
          </div>
          
          <AnimatePresence mode="wait">
            {step === 1 && (
                <motion.div key="step-1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                    <header className="space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white leading-none uppercase italic">Votre <span className="text-primary italic">Établissement.</span></h1>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-widest opacity-60 italic">Configuration initiale Jangu ERP</p>
                    </header>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Nom de l&apos;École / Complexe Éducatif</label>
                            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Collège Sacré-Cœur Dakar" className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-sm font-black text-white focus:border-primary/50 outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Téléphone de l&apos;Établissement</label>
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: +221 77 000 00 00" className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-[11px] font-black text-white focus:border-primary/50 outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">NINEA / Registre (Optionnel)</label>
                            <input value={ninea} onChange={(e) => setNinea(e.target.value)} placeholder="Optionnel" className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-[11px] font-black text-white focus:border-primary/50 outline-none transition-all" />
                        </div>
                    </div>
                    <button onClick={handleNext} disabled={!name} className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50">
                        Étape Suivante <ArrowRight className="w-3 h-3" />
                    </button>
                </motion.div>
            )}

            {step === 2 && (
                <motion.div key="step-2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                    <header className="space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white leading-none uppercase italic">Classes <span className="text-emerald-500 italic">Initiales.</span></h1>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-widest opacity-60 italic">Définissez vos premières classes et écolages mensuels</p>
                    </header>
                    
                    <div className="space-y-2 max-h-[250px] overflow-y-auto no-scrollbar pr-1">
                        {initialClasses.map((c, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input placeholder="Nom Classe (ex: CM2 A)" value={c.name} onChange={(e) => updateInitialClass(index, 'name', e.target.value)} className="flex-1 bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-[11px] font-black uppercase text-white focus:border-emerald-500/50 outline-none" />
                                <input type="number" placeholder="Mensualité FCFA" value={c.monthlyFee} onChange={(e) => updateInitialClass(index, 'monthlyFee', e.target.value)} className="w-32 bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-[11px] font-black text-emerald-500 outline-none" />
                                {initialClasses.length > 1 && (
                                    <button onClick={() => removeInitialClass(index)} className="p-3 rounded-lg bg-red-500/5 text-red-500 hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></button>
                                )}
                            </div>
                        ))}
                        <button onClick={addInitialClass} className="w-full py-2 border border-dashed border-white/5 rounded-lg text-gray-600 hover:text-white hover:border-white/10 transition-all text-[9px] uppercase font-black tracking-[0.2em]">+ Ajouter une Classe</button>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button onClick={handleBack} className="flex-1 py-4 bg-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest rounded-xl">Retour</button>
                        <button onClick={handleNext} className="flex-[2] py-4 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-lg">Continuer</button>
                    </div>
                </motion.div>
            )}

            {step === 3 && (
                <motion.div key="step-3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6 text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto opacity-80" />
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Prêt à <span className="text-primary italic">Lancer.</span></h2>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Confirmation des paramètres de l&apos;école</p>
                    </div>

                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 text-left">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-500 font-black uppercase tracking-widest">Établissement</span>
                            <span className="text-white font-black uppercase italic">{name}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-500 font-black uppercase tracking-widest">NINEA</span>
                            <span className="text-primary font-black uppercase italic">{ninea || "Non renseigné"}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-500 font-black uppercase tracking-widest">Classes configurées</span>
                            <span className="text-white font-black uppercase italic">{initialClasses.length} Classe(s)</span>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button onClick={handleBack} className="flex-1 py-4 bg-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest rounded-xl">Modifier</button>
                        <button onClick={handleSubmit} disabled={loading} className="flex-[3] py-4 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accéder au Tableau de Bord"}
                        </button>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
