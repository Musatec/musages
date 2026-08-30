import { auth } from "@/auth";
import { Search, MapPin, Phone, Award, CheckCircle2, ArrowLeft, GraduationCap, Calendar, Briefcase } from "lucide-react";
import Link from "next/link";

export default async function OustazsDirectoryPage() {
  const session = await auth();

  // Liste de démonstration des Oustazs inscrits
  const oustazs = [
    {
      id: "OUST-001",
      name: "Oustaz Mouhamed Ndiaye",
      city: "Dakar (Pikine)",
      specialty: "Tahfiz Coran & Tajwid Avancé",
      qiraat: "Warsh 'an Nafi'",
      experience: "12 ans d'expérience",
      ijazah: "Certifié Ijazah Warsh • Université Al-Azhar (Dakar)",
      availability: "Disponible (Temps plein / Vacations)",
      phone: "+221 77 234 56 78",
      verified: true
    },
    {
      id: "OUST-002",
      name: "Oustaz Ibrahim Sarr",
      city: "Touba",
      specialty: "Mémorisation Intensification & Muraja'a",
      qiraat: "Warsh & Hafs",
      experience: "8 ans d'expérience",
      ijazah: "Certifié Hafiz Coran • Daara Touba Khelcom",
      availability: "Disponible (Créneau Matin / Après-midi)",
      phone: "+221 78 876 54 32",
      verified: true
    },
    {
      id: "OUST-003",
      name: "Oustaz Abdoulaye Kane",
      city: "Thiès",
      specialty: "Enseignement Coranique Enfants & Calligraphie Allwa",
      qiraat: "Warsh 'an Nafi'",
      experience: "15 ans d'expérience",
      ijazah: "Diplômé Supérieur en Sciences du Coran",
      availability: "Disponible (Internat / Daara Modèle)",
      phone: "+221 76 345 67 89",
      verified: true
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
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Morceau 4 • Bourse d'Emploi & Recrutement</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Annuaire & Recrutement des Oustazs</h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Permettez aux directeurs de Daaras d'entrer en contact direct avec des enseignants coraniques qualifiés et certifiés.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-8">
        
        {/* Actions & Barre de Recherche */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            <Search className="w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher un Oustaz par nom, spécialité (Tajwid, Warsh, Hafs...) ou ville..."
              className="bg-transparent w-full text-xs font-semibold outline-none text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <button className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-2 transition-all shadow-sm">
            <Briefcase className="w-4 h-4" /> S'inscrire comme Oustaz
          </button>
        </div>

        {/* Liste des Oustazs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {oustazs.map((oustaz) => (
            <div key={oustaz.id} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 hover:border-emerald-600 transition-all shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-bold text-slate-900">{oustaz.name}</h3>
                      {oustaz.verified && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-xs font-semibold text-emerald-700">{oustaz.specialty}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">{oustaz.experience}</span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded border border-slate-100">
                  <p className="flex items-center gap-1.5 font-medium text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" /> {oustaz.city}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Lecture : {oustaz.qiraat}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <Award className="w-3.5 h-3.5 text-amber-600" /> {oustaz.ijazah}
                  </p>
                </div>

                <p className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 w-fit">
                  ● {oustaz.availability}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 font-mono">{oustaz.id}</span>
                <a href={`tel:${oustaz.phone}`} className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> Contacter Oustaz
                </a>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
