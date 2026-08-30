import { auth } from "@/auth";
import { AlertTriangle, PhoneCall, Share2, Search, MapPin, Calendar, Clock, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SosDisparusPage() {
  const session = await auth();

  // Mock list of active SOS alerts for demonstration
  const alerts = [
    {
      id: "SOS-2026-001",
      name: "Modou Faye",
      age: 11,
      daara: "Daara Serigne Saliou",
      city: "Touba (Ndamatou)",
      date: "30 Août 2026",
      time: "14:30",
      description: "Portait un boubou bleu et un bonnet blanc. A été vu pour la dernière fois près du marché Ocass.",
      contact: "+221 77 123 45 67",
      status: "URGENT"
    },
    {
      id: "SOS-2026-002",
      name: "Cheikh Ndiaye",
      age: 9,
      daara: "Daara El Hadji Omar",
      city: "Dakar (Pikine Icotaf)",
      date: "29 Août 2026",
      time: "17:00",
      description: "Teint clair, s'est éloigné après la prière d'Asr.",
      contact: "+221 78 987 65 43",
      status: "RECHERCHE EN COURS"
    }
  ];

  return (
    <div className="min-h-screen bg-[#080303] text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-red-500/20 pb-6">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center font-black">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white italic">
                  🚨 Réseau SOS <span className="text-red-500">Talibés Disparus</span>
                </h1>
                <p className="text-xs text-slate-400">Plateforme nationale d'urgence et de recherche communautaire géolocalisée</p>
              </div>
            </div>
          </div>

          <button className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center gap-2 active:scale-95 transition-all">
            <ShieldAlert className="w-4 h-4" /> Signaler une disparition
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Rechercher par prénom, ville, quartier ou nom de Daara..." 
            className="bg-transparent w-full text-xs font-bold outline-none text-white placeholder:text-slate-500 uppercase tracking-wider"
          />
        </div>

        {/* Alert List */}
        <div className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
            Signalements d'urgence actifs ({alerts.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-[#120808] border border-red-500/30 rounded-2xl p-6 space-y-4 hover:border-red-500/70 transition-all relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">{alert.id}</span>
                    <h3 className="text-xl font-black text-white uppercase italic mt-1">{alert.name}, {alert.age} ans</h3>
                    <p className="text-xs font-bold text-amber-400">{alert.daara}</p>
                  </div>
                  <span className="px-3 py-1 bg-red-600 text-white font-black text-[9px] uppercase tracking-wider rounded-full shadow-md animate-pulse">
                    {alert.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-red-400" /> {alert.city}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Disparu le {alert.date} vers {alert.time}
                  </div>
                  <p className="text-slate-300 pt-1 leading-relaxed italic">{alert.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <a href={`tel:${alert.contact}`} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
                    <PhoneCall className="w-3.5 h-3.5" /> Appeler tuteur ({alert.contact})
                  </a>
                  <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all" title="Partager alerte">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
