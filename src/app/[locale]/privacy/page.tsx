import { ShieldCheck, Eye, Lock, Globe } from "lucide-react";

export default async function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 relative overflow-hidden flex flex-col p-6 md:p-12">
            {/* Mesh Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] opacity-10" />
            
            <div className="relative z-10 w-full max-w-4xl mx-auto space-y-12 py-12">
                
                <header className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic">
                        <ShieldCheck className="w-3 h-3" />
                        Confidentialité Alpha
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                        POLITIQUE DE <br />
                        <span className="text-gray-500 text-2xl md:text-4xl">DONNÉES PRIVÉES.</span>
                    </h1>
                    <p className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed italic opacity-80">
                        Votre vie privée est le noyau de notre sécurité.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-white/5 pt-12">
                    <aside className="md:col-span-4 hidden md:block space-y-6 sticky top-12 h-fit">
                        <LegalNav title="Données Collectées" id="data" />
                        <LegalNav title="Utilisation" id="usage" />
                        <LegalNav title="Protection" id="protection" />
                        <LegalNav title="Vos Droits" id="rights" />
                        <LegalNav title="Partenaires Tiers" id="thirdparty" />
                    </aside>

                    <div className="md:col-span-8 prose prose-invert prose-sm max-w-none space-y-12">
                        
                        <section id="data" className="space-y-4">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-blue-500">1. Nature des Données Collectées</h2>
                            <p className="text-gray-400 font-bold leading-relaxed italic">
                                Nous collectons les informations nécessaires au bon fonctionnement de l'ERP : 
                                données d'identification (nom, mail), informations sur vos points de vente, 
                                inventaires, et historiques de transactions.
                            </p>
                        </section>

                        <section id="usage" className="space-y-4">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-blue-500">2. Utilisation des Informations</h2>
                            <p className="text-gray-400 leading-relaxed italic">
                                Vos données sont traitées uniquement pour :
                                <br />• La gestion de votre activité commerciale.
                                <br />• L'optimisation de vos stocks via nos algorithmes IA.
                                <br />• La sécurisation de vos accès et de votre trésorerie.
                            </p>
                        </section>

                        <section id="protection" className="space-y-4">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-blue-500">3. Protocoles de Sécurité</h2>
                            <p className="text-gray-400 leading-relaxed italic">
                                Toutes les données sont chiffrées en transit (SSL/TLS) et au repos chez notre hébergeur Supabase. 
                                Nous utilisons des protocoles d'isolation multi-tenants pour garantir qu'aucune donnée d'un store 
                                ne puisse être accédée par un tiers.
                            </p>
                        </section>

                        <section id="thirdparty" className="space-y-4">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-blue-500">4. Partage des Données</h2>
                            <p className="text-gray-400 leading-relaxed italic">
                                Nous ne vendons jamais vos données. Cependant, nous partageons les informations minimales requises avec :
                                <br />• **PayTech** : Pour le traitement de vos abonnements.
                                <br />• **Sentry** : Pour l'analyse de crashs techniques.
                                <br />• **Resend** : Pour l'envoi de vos reçus et alertes.
                            </p>
                        </section>

                    </div>
                </div>

                <footer className="pt-12 border-t border-white/5 flex flex-col items-center gap-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">
                        Une question sur vos droits (RGPD) ?
                    </p>
                    <a href="mailto:privacy@musages.com" className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-blue-600 hover:text-white transition-all italic">
                        Accéder au centre de confidentialité
                    </a>
                </footer>
            </div>
        </div>
    );
}

function LegalNav({ title, id }: { title: string; id: string }) {
    return (
        <a href={`#${id}`} className="block text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-blue-500 transition-colors italic">
            {title}
        </a>
    );
}
