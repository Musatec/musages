import { FileText, Shield, Scale, HelpCircle } from "lucide-react";

export default async function TermsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 relative overflow-hidden flex flex-col p-6 md:p-12">
            {/* Mesh Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] opacity-10" />
            
            <div className="relative z-10 w-full max-w-4xl mx-auto space-y-12 py-12">
                
                <header className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">
                        <Scale className="w-3 h-3" />
                        Cadre Juridique MINDOS
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                        CONDITIONS GÉNÉRALES <br />
                        <span className="text-gray-500 text-2xl md:text-4xl">D'UTILISATION (CGU).</span>
                    </h1>
                    <p className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed italic opacity-80">
                        Dernière mise à jour : 17 Avril 2026
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-white/5 pt-12">
                    <aside className="md:col-span-4 hidden md:block space-y-6 sticky top-12 h-fit">
                        <LegalNav title="Introduction" id="intro" />
                        <LegalNav title="Services Offerts" id="services" />
                        <LegalNav title="Gestion des Comptes" id="accounts" />
                        <LegalNav title="Paiements & Tarifs" id="billing" />
                        <LegalNav title="Propriété Intellectuelle" id="ip" />
                        <LegalNav title="Responsabilités" id="liability" />
                    </aside>

                    <div className="md:col-span-8 prose prose-invert prose-sm max-w-none space-y-12">
                        
                        <section id="intro" className="space-y-4">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-primary">1. Préambule</h2>
                            <p className="text-gray-400 font-bold leading-relaxed italic">
                                MINDOS (ci-après "le Service") est une plateforme logicielle éditée par Musatec Enterprise. 
                                En accédant ou en utilisant MINDOS, vous acceptez d'être lié par les présentes CGU. 
                                Si vous n'acceptez pas ces termes, veuillez cesser toute utilisation du Service.
                            </p>
                        </section>

                        <section id="services" className="space-y-4">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-primary">2. Description des Services</h2>
                            <p className="text-gray-400 leading-relaxed italic">
                                MINDOS fournit des outils de gestion ERP (Enterprise Resource Planning) incluant, sans s'y limiter : 
                                gestion de stock, point de vente (POS), suivi de trésorerie, et analyse via intelligence artificielle.
                            </p>
                        </section>

                        <section id="accounts" className="space-y-4">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-primary">3. Création et Sécurité du Compte</h2>
                            <p className="text-gray-400 leading-relaxed italic">
                                L'utilisateur est seul responsable du maintien de la confidentialité de ses identifiants. 
                                Toute activité effectuée sous votre compte est sous votre entière responsabilité. 
                                Vous vous engagez à notifier immédiatement Musatec de toute utilisation non autorisée.
                            </p>
                        </section>

                        <section id="billing" className="space-y-4">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-primary">4. Modalités de Paiement</h2>
                            <p className="text-gray-400 leading-relaxed italic">
                                Les services sont facturés sur une base mensuelle selon le plan choisi (Starter, Growth, Business). 
                                Les paiements sont sécurisés et traités par nos partenaires tiers (PayTech). 
                                Tout retard de paiement peut entraîner une suspension immédiate de l'accès à la plateforme.
                            </p>
                        </section>

                        <section id="liability" className="space-y-4">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-primary">5. Limitation de Responsabilité</h2>
                            <p className="text-gray-400 leading-relaxed italic">
                                MINDOS est fourni "en l'état". Bien que nous nous efforcions d'assurer une disponibilité maximale, 
                                Musatec ne peut être tenue responsable des interruptions de service, pertes de données 
                                ou erreurs de gestion commerciale résultant de l'utilisation du logiciel.
                            </p>
                        </section>

                    </div>
                </div>

                <footer className="pt-12 border-t border-white/5 flex flex-col items-center gap-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">
                        Besoin de précisions juridiques ?
                    </p>
                    <a href="mailto:legal@musages.com" className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-primary hover:text-black transition-all italic">
                        Contacter le département légal
                    </a>
                </footer>
            </div>
        </div>
    );
}

function LegalNav({ title, id }: { title: string; id: string }) {
    return (
        <a href={`#${id}`} className="block text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-primary transition-colors italic">
            {title}
        </a>
    );
}
