"use client";

import { useCallback, useEffect, useState } from "react";
import { 
  Gift,
  Plus,
  Search,
  DollarSign,
  Package,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getDonations, recordDonation } from "@/lib/actions/donations";

interface Donation {
  id: string;
  donorName: string;
  donorPhone?: string | null;
  type: "FINANCIER" | "DON_NATURE";
  amount?: number | null;
  natureDetails?: string | null;
  paymentMethod?: string | null;
  date: string;
  notes?: string | null;
}

export function DonationManager() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [totalFinancial, setTotalFinancial] = useState(0);
  const [natureCount, setNatureCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // States pour nouveau don
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donationType, setDonationType] = useState<"FINANCIER" | "DON_NATURE">("DON_NATURE");
  const [amount, setAmount] = useState("");
  const [natureDetails, setNatureDetails] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CHEQUE" | "VIREMENT">("CASH");

  const loadDonations = useCallback(async () => {
    try {
      const result = await getDonations();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDonations(result.donations.map((donation) => ({ ...donation, date: donation.date.toISOString() })));
      setTotalFinancial(result.totalFinancial);
      setNatureCount(result.natureCount);
    } catch {
      toast.error("Impossible de charger le registre des dons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadDonations(); }, [loadDonations]);

  const filtered = donations.filter(d => 
    d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.natureDetails && d.natureDetails.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddDonation = async () => {
    if (!donorName) {
      toast.error("Veuillez renseigner le nom du donateur !");
      return;
    }
    const amountValue = Number(amount);
    if (donationType === "FINANCIER" && (!Number.isFinite(amountValue) || amountValue <= 0)) {
      toast.error("Saisissez un montant valide pour le don reçu.");
      return;
    }
    if (donationType === "DON_NATURE" && !natureDetails.trim()) {
      toast.error("Décrivez le don en nature reçu.");
      return;
    }

    setSaving(true);
    try {
      const result = await recordDonation({
        donorName,
        donorPhone,
        type: donationType,
        amount: donationType === "FINANCIER" ? amountValue : undefined,
        natureDetails: donationType === "DON_NATURE" ? natureDetails : undefined,
        paymentMethod: donationType === "FINANCIER" ? paymentMethod : undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Don reçu et inscrit dans le registre.");
      setDonorName("");
      setDonorPhone("");
      setNatureDetails("");
      await loadDonations();
    } catch {
      toast.error("Impossible d'enregistrer le don. Réessayez.");
    } finally {
      setSaving(false);
    }
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
            Consignez les dons reçus par le Daara. La saisie est faite manuellement par le bureau ; aucun paiement n'est effectué dans l'application.
          </p>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Sadaqa Financière</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{totalFinancial.toLocaleString()} FCFA</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Dons financiers consignés par le bureau</p>
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
              <h3 className="text-2xl font-black text-amber-400 mt-1">{natureCount} Livraisons</h3>
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
                    <label className="text-xs font-bold text-muted-foreground uppercase">Mode de réception enregistré au bureau</label>
                    <select 
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                      className="w-full mt-1 p-2 bg-background border rounded-lg text-sm"
                    >
                      <option value="CASH">Espèces</option>
                      <option value="CHEQUE">Chèque</option>
                      <option value="VIREMENT">Virement déjà reçu</option>
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

              <Button onClick={handleAddDonation} disabled={saving} className="w-full bg-emerald-500 text-black font-bold">
                {saving ? "Enregistrement…" : "Confirmer la réception du don"}
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
          {!loading && filtered.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">Aucun don enregistré pour le moment.</p>
          )}
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
                      {item.type === "FINANCIER" ? `Don reçu · ${item.paymentMethod || "mode non précisé"}` : "Don en Nature"}
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
                <span className="text-xs font-mono text-muted-foreground">{new Date(item.date).toLocaleString("fr-FR")}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
