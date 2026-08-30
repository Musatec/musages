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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Header */}
      <div className="bg-slate-900 text-white py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>
          <div className="space-y-2">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Morceau 3 • Annuaire National</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Annuaire des Daaras du Sénégal</h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Permettez aux parents de rechercher un Daara de confiance, consulter son programme, ses régimes d'accueil et contacter directement la direction.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-8">
        
        {/* Barre de Recherche */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            <Search className="w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher par nom de Daara, ville (Dakar, Touba, Kaolack...) ou quartier..."
              className="bg-transparent w-full text-xs font-semibold outline-none text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select className="bg-slate-100 border border-slate-200 text-xs font-semibold px-3 py-2 rounded text-slate-700 outline-none">
              <option>Toutes les villes</option>
              <option>Dakar</option>
              <option>Touba</option>
              <option>Tivaouane</option>
              <option>Kaolack</option>
              <option>Saint-Louis</option>
            </select>
            <select className="bg-slate-100 border border-slate-200 text-xs font-semibold px-3 py-2 rounded text-slate-700 outline-none">
              <option>Tous les régimes</option>
              <option>Internat Pensionnat</option>
              <option>Externat</option>
            </select>
          </div>
        </div>

        {/* Liste des Daaras */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {daaras.map((daara) => (
            <div key={daara.id} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 hover:border-emerald-600 transition-all shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{daara.type}</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">{daara.name}</h3>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {daara.rating}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" /> {daara.city} ({daara.district})
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Lecture : {daara.qiraat}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic border-t border-slate-100 pt-3">
                  "{daara.description}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {daara.studentsCount} Talibés</span>
                </div>
                <a href={`tel:${daara.phone}`} className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm">
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
