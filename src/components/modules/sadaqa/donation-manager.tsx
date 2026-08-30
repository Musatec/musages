"use client";

import { useState } from "react";
import { 
  Gift, 
  Plus, 
  Search, 
  DollarSign, 
  Package, 
  Calendar, 
  CheckCircle2, 
  Heart,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Donation {
  id: string;
  donorName: string;
  donorPhone: string;
  type: "FINANCIER" | "DON_NATURE";
  amount?: number;
  natureDetails?: string;
  paymentMethod?: string; // Wave, Orange Money, Cash
  date: string;
  notes?: string;
}

const MOCK_DONATIONS: Donation[] = [
  { id: "1", donorName: "Moustapha Sall (Anonyme)", donorPhone: "+221 77 999 88 77", type: "DON_NATURE", natureDetails: "10 Sacs de Riz 50kg, 2 Bidons d'huile 20L", date: "Aujourd'hui, 11h30", notes: "Donation pour la restauration des pensionnaires" },
  { id: "2", donorName: "Sokhna Aida Mbacké", donorPhone: "+221 78 444 33 22", type: "FINANCIER", amount: 100000, paymentMethod: "Wave", date: "Hier, 16h45", notes: "Zakat Al-Mal" },
  { id: "3", donorName: "Dahirou Touba Dakar", donorPhone: "+221 33 123 99 00", type: "DON_NATURE", natureDetails: "50 Nattes de Prières, Kits d'hygiène et Savons", date: "22/08/2026", notes: "Sadaqa Gamou" },
];

export function DonationManager() {
  const [donations, setDonations] = useState<Donation[]>(MOCK_DONATIONS);
  const [searchTerm, setSearchTerm] = useState("");

  // States pour nouveau don
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donationType, setDonationType] = useState<"FINANCIER" | "DON_NATURE">("DON_NATURE");
  const [amount, setAmount] = useState("50000");
  const [natureDetails, setNatureDetails] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Wave");

  const filtered = donations.filter(d => 
    d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.natureDetails && d.natureDetails.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalCashSadaqa = donations
    .filter(d => d.type === "FINANCIER" && d.amount)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalNatureDonations = donations.filter(d => d.type === "DON_NATURE").length;

  const handleAddDonation = () => {
    if (!donorName) {
      toast.error("Veuillez renseigner le nom du donateur !");
      return;
    }

    const created: Donation = {
      id: Date.now().toString(),
      donorName,
      donorPhone: donorPhone || "+221 77 000 00 00",
      type: donationType,
      amount: donationType === "FINANCIER" ? Number(amount) : undefined,
      natureDetails: donationType === "DON_NATURE" ? natureDetails : undefined,
      paymentMethod: donationType === "FINANCIER" ? paymentMethod : undefined,
      date: "À l'instant",
      notes: "Sadaqa enregistrée dans la caisse du Daara"
    };

    setDonations([created, ...donations]);
    toast.success(`Don de Sadaqa enregistré avec succès ! Qu'Allah bénisse le donateur.`);
    setDonorName("");
    setNatureDetails("");
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 md:p-8 text-white border border-emerald-500/20 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5" /> Gestion des Dons & Sadaqa (الصدقات والتبرعات)
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-arabic">
            سجل الصدقات والتبرعات العينية والمالية
          </h1>
          <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed">
            Enregistrez les dons financiers (Wave, Orange Money, Cash) et les dons en nature (sacs de riz, huile, matériel) pour les Talibés du Daara.
          </p>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Sadaqa Financière</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{totalCashSadaqa.toLocaleString()} FCFA</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Collectés via Wave, OM & Cash</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dons en Nature Réceptionnés</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{totalNatureDonations} Livraisons</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Sacs de riz, huile, vêtements, nattes</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par donateur ou type de don..." 
            className="pl-9 h-10 text-xs"
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Enregistrer un Don de Sadaqa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-400" /> Saisie d'un Don de Sadaqa
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Nom du Donateur (ou Anonyme)</label>
                <Input 
                  placeholder="Ex: El-Hadj Ousmane Sow" 
                  value={donorName}
                  onChange={(e: any) => setDonorName(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Téléphone WhatsApp</label>
                <Input 
                  placeholder="Ex: +221 77 000 00 00" 
                  value={donorPhone}
                  onChange={(e: any) => setDonorPhone(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Type de Don</label>
                <select 
                  value={donationType}
                  onChange={(e: any) => setDonationType(e.target.value as any)}
                  className="w-full mt-1 p-2 bg-background border rounded-lg text-sm"
                >
                  <option value="DON_NATURE">Don en Nature (Riz, Huile, Vêtements...)</option>
                  <option value="FINANCIER">Don Financier (FCFA)</option>
                </select>
              </div>

              {donationType === "FINANCIER" ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase">Montant (FCFA)</label>
                    <Input 
                      type="number" 
                      value={amount}
                      onChange={(e: any) => setAmount(e.target.value)}
                      className="mt-1 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase">Moyen de Paiement</label>
                    <select 
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                      className="w-full mt-1 p-2 bg-background border rounded-lg text-sm"
                    >
                      <option value="Wave">Wave Direct</option>
                      <option value="Orange Money">Orange Money</option>
                      <option value="Espèces">Espèces (Guichet Daara)</option>
                      <option value="Virement">Virement BTP / Banque</option>
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Détails du Don en Nature</label>
                  <Input 
                    placeholder="Ex: 5 sacs de riz 50kg, 1 carton de savon" 
                    value={natureDetails}
                    onChange={(e: any) => setNatureDetails(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
              )}

              <Button onClick={handleAddDonation} className="w-full bg-emerald-500 text-black font-bold">
                Enregistrer la Sadaqa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Registre des Dons */}
      <Card className="border-border/50 shadow-md">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-base font-bold">Registre des Dons du Daara</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y">
          {filtered.map((item) => (
            <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-accent/20 transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                  item.type === "FINANCIER" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                }`}>
                  {item.type === "FINANCIER" ? <DollarSign className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    {item.donorName}
                    <Badge variant="outline" className={`text-[10px] ${
                      item.type === "FINANCIER" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}>
                      {item.type === "FINANCIER" ? `Donation Cash (${item.paymentMethod})` : "Don en Nature"}
                    </Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.type === "FINANCIER" 
                      ? `Montant: ${item.amount?.toLocaleString()} FCFA` 
                      : `Fournitures: ${item.natureDetails}`}
                  </p>
                  <p className="text-[10px] text-muted-foreground/80 italic mt-0.5">{item.notes}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-muted-foreground">{item.date}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
