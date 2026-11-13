"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { createSchool } from "@/lib/actions/schools";
import { toast } from "sonner";
import { Building2, Loader2, ArrowRight } from "lucide-react";

export function SetupClient({ defaultName }: { defaultName?: string }) {
  const router = useRouter();
  const [name, setName] = useState(defaultName ? `Daara de ${defaultName}` : "");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ninea, setNinea] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Veuillez saisir le nom de votre Daara.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createSchool({
        name: name.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        ninea: ninea.trim() || undefined,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Daara configuré avec succès !");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Impossible de finaliser la configuration du Daara.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Configuration de votre Daara</h1>
          <p className="text-sm text-muted-foreground">
            Renseignez les informations de votre établissement pour accéder à votre espace de gestion.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nom du Daara *
            </label>
            <input
              required
              minLength={2}
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Daara Ibnoul Khayim Al Diawziya"
              className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Téléphone
              </label>
              <input
                maxLength={40}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+221 77 000 00 00"
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                E-mail
              </label>
              <input
                type="email"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@daara.sn"
                className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Adresse
            </label>
            <input
              maxLength={200}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Quartier, Ville"
              className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              N° Agrément / NINEA (optionnel)
            </label>
            <input
              maxLength={80}
              value={ninea}
              onChange={(e) => setNinea(e.target.value)}
              placeholder="Référence officielle"
              className="w-full h-11 rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Finaliser la configuration
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

