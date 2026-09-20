import { auth } from "@/auth";
import { Search, MapPin, Phone, BookOpen, Users, ArrowLeft, Star, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function DaarasDirectoryPage() {
  const session = await auth();

  // Liste de démonstration des Daaras enregistrés
  const daaras = [
    {
      id: "DAR-001",
      name: "Daara Al-Nour",
      city: "Touba",
      district: "Ndamatou",
      type: "Pensionnat Interne & Externe",
      studentsCount: 142,
      teachersCount: 6,
      phone: "+221 77 123 45 67",
      qiraat: "Warsh 'an Nafi'",
      rating: "4.9",
      description: "Daara moderne spécialisé dans la mémorisation complète du Saint Coran, l'enseignement du Tajwid et l'éducation civique."
    },
    {
      id: "DAR-002",
      name: "Daara Imam Malik",
      city: "Dakar",
      district: "Sacré-Cœur 3",
      type: "Externat & Cours du Soir",
      studentsCount: 95,
      teachersCount: 4,
      phone: "+221 78 987 65 43",
      qiraat: "Warsh & Hafs",
      rating: "4.8",
      description: "Établissement coranique modèle combinant programme de Tahfiz intensif et accompagnement scolaire."
    },
    {
      id: "DAR-003",
      name: "Daara Serigne Saliou",
      city: "Mbour",
      district: "Grand Mbour",
      type: "Pensionnat Interne",
      studentsCount: 210,
      teachersCount: 9,
      phone: "+221 76 543 21 09",
      qiraat: "Warsh 'an Nafi'",
      rating: "5.0",
      description: "Grand complexe coranique traditionnel assurant la prise en charge complète et la formation spirituelle des Talibés."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans py-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Épuré */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>
          <div className="space-y-2">
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60 inline-block">
              Annuaire National • Sénégal & Afrique de l'Ouest
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Annuaire des Daaras du Sénégal
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Recherchez un Daara de confiance, consultez son programme de mémorisation des 60 Hizbs, ses régimes d'accueil (internat/externat) et contactez directement la direction.
            </p>
          </div>
        </div>

        {/* Barre de Recherche & Filtres */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1 bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input 
              type="text"
              placeholder="Rechercher par nom de Daara, ville (Dakar, Touba, Kaolack...) ou quartier..."
              className="bg-transparent w-full text-xs font-medium outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <select className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 outline-none">
              <option>Toutes les villes</option>
              <option>Dakar</option>
              <option>Touba</option>
              <option>Tivaouane</option>
              <option>Kaolack</option>
              <option>Saint-Louis</option>
            </select>
            <select className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 outline-none">
              <option>Tous les régimes</option>
              <option>Internat Pensionnat</option>
              <option>Externat</option>
            </select>
          </div>
        </div>

        {/* Liste des Daaras */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {daaras.map((daara) => (
            <div key={daara.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 hover:border-emerald-500/50 transition-all shadow-xs flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60 inline-block">{daara.type}</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{daara.name}</h3>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {daara.rating}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <p className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> {daara.city} ({daara.district})
                  </p>
                  <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <BookOpen className="w-4 h-4 text-slate-400 shrink-0" /> Lecture : {daara.qiraat}
                  </p>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic border-t border-slate-100 dark:border-slate-800 pt-3">
                  "{daara.description}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <Users className="w-4 h-4 text-slate-400" /> {daara.studentsCount} Talibés
                </div>
                <a href={`tel:${daara.phone}`} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs">
                  <Phone className="w-3.5 h-3.5" /> Contacter
                </a>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
