"use client";

import { useState, useEffect } from "react";
import { createStore } from "@/lib/actions/store";
import { createProduct } from "@/lib/actions/inventory";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
    Building2, ArrowRight, Loader2, CheckCircle2, 
    Globe, ShieldCheck, Zap, Sparkles, Package, 
    Trash2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";
import { SafeImage } from "@/components/ui/safe-image";

interface InitialProduct {
    name: string;
    price: string;
}

export function StoreOnboarding() {
  const { data: session, update } = useSession();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [initialProducts, setInitialProducts] = useState<InitialProduct[]>([
      { name: "Article Alpha", price: "7500" }
  ]);
  const [logo, setLogo] = useState("");
  const [slogan, setSlogan] = useState("Le futur de votre gestion.");
  const [activity, setActivity] = useState("");

  // Pré-remplissage intelligent à partir de Google
  useEffect(() => {
    if (session?.user) {
      if (!name && session.user.name) setName(session.user.name);
      if (!logo && session.user.image) setLogo(session.user.image);
    }
  }, [session, name, logo]);

  const [plan, setPlan] = useState<"STARTER" | "GROWTH" | "BUSINESS">("STARTER");

  useEffect(() => {
    const match = document.cookie.match(/mindos_plan=([^;]+)/);
    const cookiePlan = match ? match[1] : null;
    if (cookiePlan === "STARTER" || cookiePlan === "GROWTH" || cookiePlan === "BUSINESS") {
      setPlan(cookiePlan);
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const addInitialProduct = () => setInitialProducts([...initialProducts, { name: "", price: "" }]);
  const removeInitialProduct = (index: number) => setInitialProducts(initialProducts.filter((_, i) => i !== index));
  const updateInitialProduct = (index: number, field: keyof InitialProduct, value: string) => {
      const newProducts = [...initialProducts];
      newProducts[index][field] = value;
      setInitialProducts(newProducts);
  };

  const handleSubmit = async () => {
    if (!name) return toast.error("Le nom de l'entreprise est requis");

    setLoading(true);
    const result = await createStore({ 
        name, 
        address, 
        plan,
        config: {
            logo,
            slogan,
            activity
        }
    });

    if (result.success) {
      const validProducts = initialProducts.filter(p => p.name && p.price);
      if (validProducts.length > 0) {
          for (const prod of validProducts) {
              await createProduct({
                  name: prod.name,
                  price: Number(prod.price),
                  stock: 10,
                  category: "Initial",
                  storeId: result.storeId
              });
          }
      }

      toast.success("Votre Empire est prêt ! ✨");
      
      await update({
        user: {
          storeId: result.storeId,
          role: "ADMIN"
        }
      });

      router.push("/dashboard");
    } else {
      toast.error(result.error || "Une erreur est survenue");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505] overflow-hidden">
      <div className="fixed inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] opacity-10" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/20 rounded-full blur-[120px] opacity-10" />
      </div>

      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full relative z-10"
      >
        <div className="bg-[#0A0A0B]/80 backdrop-blur-3xl border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          
          <div className="flex items-center gap-1.5 mb-8">
              {[1, 2, 3, 4, 5].map((s) => (
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
                <motion.div key="step-1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6" >
                    <header className="space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white leading-none uppercase italic">Votre <span className="text-primary italic">Empire.</span></h1>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-widest opacity-60 italic">Quelle est l&apos;activité principale de votre hub ?</p>
                    </header>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Nom de la Boutique</label>
                            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Boutique Luxe Abidjan" className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-sm font-black uppercase text-white focus:border-primary/50 outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Secteur d&apos;Activité</label>
                            <input value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Ex: Prêt-à-porter, Quincaillerie..." className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-[11px] font-black uppercase text-white focus:border-primary/50 outline-none transition-all" />
                        </div>
                    </div>
                    <button onClick={handleNext} disabled={!name} className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50" >
                        Étape Suivante <ArrowRight className="w-3 h-3" />
                    </button>
                </motion.div>
            )}

            {step === 2 && (
                <motion.div key="step-2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6" >
                    <header className="space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-orange-500" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white leading-none uppercase italic">Signature <span className="text-primary italic">Alpha.</span></h1>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-widest opacity-60 italic">Personnalisez vos futures factures</p>
                    </header>
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Identité Visuelle (Logo)</label>
                            <ImageUpload 
                                value={logo}
                                onChange={(url) => setLogo(url)}
                                className="bg-black/20 p-2 rounded-2xl border border-white/5"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Slogan Commercial</label>
                            <input value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Le futur est ici." className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-[11px] font-black uppercase text-white focus:border-primary/50 outline-none transition-all" />
                        </div>

                        {/* LIVE RECEIPT PREVIEW */}
                        <div className="pt-4 animate-in fade-in zoom-in duration-700">
                             <div className="bg-white text-black p-6 rounded-2xl shadow-xl w-full max-w-[280px] mx-auto rotate-1 scale-90 origin-center border-t-8 border-primary relative overflow-hidden">
                                 <div className="text-center space-y-1 mb-4">
                                      {logo && (
                                          <div className="flex justify-center mb-2">
                                              <SafeImage src={logo} alt="Logo Preview" width={40} height={40} className="h-10 w-auto object-contain" />
                                          </div>
                                      )}
                                     <div className="text-sm font-black uppercase tracking-tighter leading-none">{name || "Votre Boutique"}</div>
                                     <div className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Reçu de paiement Alpha</div>
                                 </div>
                                 <div className="border-t border-dashed border-gray-200 py-3 space-y-2">
                                     <div className="flex justify-between text-[8px] font-black"><span>Article Test</span><span>12.000 F</span></div>
                                 </div>
                                 <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                     <span className="text-[10px] font-black italic">TOTAL</span>
                                     <span className="text-lg font-black italic tracking-tighter">12.000 F</span>
                                 </div>
                                 <div className="mt-4 text-center">
                                     <p className="text-[7px] font-bold text-gray-400 italic">"{slogan}"</p>
                                 </div>
                             </div>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={handleBack} className="flex-1 py-4 bg-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest rounded-xl">Retour</button>
                        <button onClick={handleNext} className="flex-[2] py-4 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary transition-all">Confirmer Style</button>
                    </div>
                </motion.div>
            )}

            {step === 3 && (
                <motion.div key="step-3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6" >
                    <header className="space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white leading-none uppercase italic">Plan <span className="text-primary italic">Stratégique.</span></h1>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-widest opacity-60 italic">Matrice de puissance</p>
                    </header>
                    <div className="grid grid-cols-1 gap-2">
                        <PlanOption title="Starter" price="3.000" details="Solo / Entrée" active={plan === "STARTER"} onClick={() => setPlan("STARTER")} icon={Zap} />
                        <PlanOption title="Growth" price="5.000" details="Optimisée 2 Staff" active={plan === "GROWTH"} onClick={() => setPlan("GROWTH")} icon={Sparkles} popular />
                        <PlanOption title="Business" price="7.000" details="Power / 5 Staff" active={plan === "BUSINESS"} onClick={() => setPlan("BUSINESS")} icon={Crown} />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={handleBack} className="flex-1 py-4 bg-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest rounded-xl">Retour</button>
                        <button onClick={handleNext} className="flex-[2] py-4 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-lg">Suivant</button>
                    </div>
                </motion.div>
            )}

            {step === 4 && (
                <motion.div key="step-4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6" >
                    <header className="space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Package className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white leading-none uppercase italic">Stock <span className="text-emerald-500 italic">Initial.</span></h1>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-widest opacity-60 italic">Chargement du catalogue</p>
                    </header>
                    
                    <div className="space-y-2 max-h-[250px] overflow-y-auto no-scrollbar pr-1">
                        {initialProducts.map((p, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input placeholder="Nom" value={p.name} onChange={(e) => updateInitialProduct(index, 'name', e.target.value)} className="flex-1 bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-[11px] font-black uppercase text-white focus:border-emerald-500/50 outline-none" />
                                <input type="number" placeholder="Prix" value={p.price} onChange={(e) => updateInitialProduct(index, 'price', e.target.value)} className="w-20 bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-[11px] font-black text-emerald-500 outline-none" />
                                {initialProducts.length > 1 && (
                                    <button onClick={() => removeInitialProduct(index)} className="p-3 rounded-lg bg-red-500/5 text-red-500 hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></button>
                                )}
                            </div>
                        ))}
                        <button onClick={addInitialProduct} className="w-full py-2 border border-dashed border-white/5 rounded-lg text-gray-600 hover:text-white hover:border-white/10 transition-all text-[9px] uppercase font-black tracking-[0.2em]">+ Ajouter Produit</button>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button onClick={handleBack} className="flex-1 py-4 bg-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest rounded-xl">Retour</button>
                        <button onClick={handleNext} className="flex-[2] py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-lg">Finaliser</button>
                    </div>
                </motion.div>
            )}

            {step === 5 && (
                <motion.div key="step-5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6 text-center" >
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto opacity-80" />
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Déploiement <span className="text-primary italic">Actif.</span></h2>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Configuration optimisée terminée</p>
                    </div>

                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 text-left">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-500 font-black uppercase tracking-widest">Empire</span>
                            <span className="text-white font-black uppercase italic">{name}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-500 font-black uppercase tracking-widest">Plan sélectionné</span>
                            <span className="text-primary font-black uppercase italic">{plan}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-500 font-black uppercase tracking-widest">Catalogue</span>
                            <span className="text-white font-black uppercase italic">{initialProducts.length} Article(s)</span>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button onClick={handleBack} className="flex-1 py-4 bg-white/5 text-gray-500 font-black uppercase text-[10px] tracking-widest rounded-xl">Réviser</button>
                        <button onClick={handleSubmit} disabled={loading} className="flex-[3] py-4 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20" >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lancer le Dashboard"}
                        </button>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          <footer className="mt-8 flex items-center justify-center gap-2 opacity-20">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">Mindos Alpha Protocol</span>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}

function PlanOption({ title, price, active, onClick, details, popular, icon: Icon }: {
    title: string;
    price: string;
    active: boolean;
    onClick: () => void;
    details: string;
    popular?: boolean;
    icon: React.ElementType;
}) {
    return (
        <div onClick={onClick} className={cn( "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group relative overflow-hidden", active ? "bg-primary/5 border-primary shadow-lg shadow-primary/10 scale-[1.01]" : "bg-white/[0.02] border-white/5 hover:border-white/10" )} >
            <div className="flex items-center gap-3 relative z-10">
                <div className={cn( "w-8 h-8 rounded-lg flex items-center justify-center border transition-all", active ? "bg-primary text-black border-primary" : "bg-white/5 border-white/10 text-gray-700" )}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{title}</h4>
                    <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{details}</p>
                </div>
            </div>
            <div className="text-right relative z-10">
                <div className="text-xs font-black text-white italic">{price} F</div>
            </div>
            {popular && (
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-primary text-black text-[6px] font-black uppercase tracking-widest rounded-bl-lg"> Populaire </div>
            )}
        </div>
    );
}

const Crown = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
);
