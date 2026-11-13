"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { signIn } from "next-auth/react";
import { useLocale } from "next-intl";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { register } from "@/lib/actions/auth";
import { useSearchParams } from "next/navigation";
import { useSpace } from "@/components/providers/space-provider";
import { Link } from "@/i18n/routing";

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === "ar";
  const searchParams = useSearchParams();
  const planParam = searchParams?.get("plan")?.toUpperCase();
  const modeParam = searchParams?.get("mode");
  const { activeSpace, setActiveSpace } = useSpace();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(modeParam === "signup" || Boolean(planParam));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDaara = activeSpace === "daara";
  const copy = isArabic
    ? {
        back: "العودة إلى الرئيسية", daara: "فضاء القرآن", daaraSub: "إدارة قرآنية", school: "مدرسة باتيه بوغني", schoolSub: "فرنسي عربي",
        loginTitle: "تسجيل الدخول", signupTitle: "إنشاء حساب المؤسسة", loginSub: "سجّل الدخول لمتابعة إدارة مؤسستك.", signupSub: "أنشئ فضاءك وابدأ فترة التجربة المجانية.",
        google: "المتابعة باستخدام Google", or: "أو باستخدام البريد الإلكتروني", name: "الاسم الكامل للمسؤول", email: "البريد الإلكتروني", password: "كلمة المرور",
        namePlaceholder: "اسم المسؤول", emailPlaceholder: "name@example.com", submitLogin: "تسجيل الدخول", submitSignup: "إنشاء الحساب", hasAccount: "لديك حساب بالفعل؟", noAccount: "ليس لديك حساب؟", switchLogin: "تسجيل الدخول", switchSignup: "إنشاء حساب",
        daaraHeadline: "إدارة دار القرآن بكل سهولة.", schoolHeadline: "إدارة مدرسية تجمع المعرفة والنجاح.", daaraBody: "تابع الحفظ والطلاب والفريق في فضاء واحد وآمن.", schoolBody: "تابع الطلاب والمعلمين والحياة المدرسية من لوحة واحدة.", welcome: "مرحباً بك في", created: "تم إنشاء الحساب. جارٍ تسجيل الدخول…", invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة.", missing: "يرجى إدخال البريد الإلكتروني وكلمة المرور.",
      }
    : {
        back: "Retour à l’accueil", daara: "Espace Daara", daaraSub: "Gestion coranique", school: "Pathé Pogne", schoolSub: "Franco-arabe",
        loginTitle: "Connexion à votre espace", signupTitle: "Créer votre établissement", loginSub: "Connectez-vous pour reprendre la gestion de votre établissement.", signupSub: "Créez votre espace et démarrez votre période d’essai.",
        google: "Continuer avec Google", or: "ou avec votre adresse e-mail", name: "Nom complet du responsable", email: "Adresse e-mail", password: "Mot de passe",
        namePlaceholder: "Nom du responsable", emailPlaceholder: "nom@exemple.com", submitLogin: "Se connecter", submitSignup: "Créer mon compte", hasAccount: "Vous avez déjà un compte ?", noAccount: "Vous nous rejoignez ?", switchLogin: "Se connecter", switchSignup: "Créer un compte",
        daaraHeadline: "Votre Daara, simplement mieux organisé.", schoolHeadline: "Une gestion scolaire claire et sereine.", daaraBody: "Suivez le Hifz, les élèves et l’équipe depuis un espace sécurisé.", schoolBody: "Retrouvez élèves, enseignants et vie scolaire sur un seul tableau de bord.", welcome: "Bienvenue dans", created: "Compte créé. Connexion en cours…", invalid: "E-mail ou mot de passe incorrect.", missing: "Veuillez saisir votre adresse e-mail et votre mot de passe.",
      };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setGoogleLoading(false);
      toast.error(isArabic ? "تعذر بدء تسجيل الدخول باستخدام Google." : "Impossible de démarrer la connexion Google.");
    }
  };

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      toast.error(copy.missing);
      return;
    }
    if (isSignUp && fullName.trim().length < 2) {
      setError(isArabic ? "يرجى إدخال الاسم الكامل." : "Veuillez saisir le nom complet du responsable.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const result = await register({ email: normalizedEmail, password, name: fullName.trim() });
        if (!result.success) {
          throw new Error(result.error || (isArabic ? "تعذر إنشاء الحساب." : "La création du compte a échoué."));
        }
        toast.success(copy.created);
      }

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });
      if (result?.error) throw new Error(copy.invalid);

      toast.success(`${copy.welcome} ${isDaara ? "Daara Ibnoul Khayim" : "Pathé Pogne"} !`);
      router.push("/dashboard");
      router.refresh();
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : (isArabic ? "حدث خطأ أثناء تسجيل الدخول." : "Une erreur est survenue lors de la connexion.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[minmax(420px,0.9fr)_1.1fr]">
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
            <ArrowRight className={`h-4 w-4 ${isArabic ? "" : "rotate-180"}`} />
            {copy.back}
          </Link>
          <img src={isDaara ? "/logo-daara-ibnoul-khayim.png" : "/logo-pathe-pogne.png"} alt="" className="h-9 w-auto object-contain lg:hidden" />
        </header>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="mb-8">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isArabic ? "بوابة آمنة" : "Portail sécurisé"}
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{isSignUp ? copy.signupTitle : copy.loginTitle}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{isSignUp ? copy.signupSub : copy.loginSub}</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-muted/50 p-1">
            <button type="button" onClick={() => setActiveSpace("daara")} aria-pressed={isDaara} className={`flex min-h-14 items-center justify-center gap-2 rounded-xl px-2.5 transition ${isDaara ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-card"}`}>
              <BookOpen className="h-4 w-4 shrink-0" />
              <span className="text-start"><span className="block text-sm font-semibold">{copy.daara}</span><span className="block text-[11px] opacity-75">{copy.daaraSub}</span></span>
            </button>
            <button type="button" onClick={() => setActiveSpace("school")} aria-pressed={!isDaara} className={`flex min-h-14 items-center justify-center gap-2 rounded-xl px-2.5 transition ${!isDaara ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-card"}`}>
              <GraduationCap className="h-4 w-4 shrink-0" />
              <span className="text-start"><span className="block text-sm font-semibold">{copy.school}</span><span className="block text-[11px] opacity-75">{copy.schoolSub}</span></span>
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && <Field label={copy.name} icon={<UserRound className="h-4 w-4" />}><input autoComplete="name" required minLength={2} maxLength={120} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder={copy.namePlaceholder} className="auth-input" /></Field>}
            <Field label={copy.email} icon={<Mail className="h-4 w-4" />}><input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder={copy.emailPlaceholder} className="auth-input" dir="ltr" /></Field>
            <Field label={copy.password} icon={<LockKeyhole className="h-4 w-4" />}>
              <input type={showPassword ? "text" : "password"} autoComplete={isSignUp ? "new-password" : "current-password"} required minLength={6} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="auth-input" dir="ltr" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? (isArabic ? "إخفاء كلمة المرور" : "Masquer le mot de passe") : (isArabic ? "إظهار كلمة المرور" : "Afficher le mot de passe")} className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isArabic ? "left-3.5" : "right-3.5"}`}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>

            {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">{error}</p>}

            <button type="submit" disabled={loading || googleLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{isSignUp ? copy.submitSignup : copy.submitLogin}<ArrowRight className={`h-4 w-4 ${isArabic ? "rotate-180" : ""}`} /></>}
            </button>
          </form>

          <div className="relative my-5 text-center text-xs font-medium text-muted-foreground">
            <span className="absolute inset-x-0 top-1/2 border-t border-border" />
            <span className="relative bg-background px-3">{isArabic ? "خيارات أخرى" : "Autres options de connexion"}</span>
          </div>
          <button type="button" onClick={handleGoogleAuth} disabled={loading || googleLoading} className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-60">
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleMark />}
            {copy.google}
          </button>
        </div>

        <footer className="pb-2 text-center text-xs text-muted-foreground">© 2026 Daara Ibnoul Khayim · École Pathé Pogne</footer>
      </section>

      <aside className="app-hero relative hidden overflow-hidden p-12 text-foreground lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative flex items-center gap-4">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm"><img src={isDaara ? "/logo-daara-ibnoul-khayim.png" : "/logo-pathe-pogne.png"} alt="" className="h-12 w-12 object-contain" /></div>
          <div><p className="text-sm font-semibold text-white/70">{copy.welcome}</p><h2 className="text-lg font-bold text-white">{isDaara ? "Daara Ibnoul Khayim" : "École Pathé Pogne"}</h2></div>
        </div>
        <div className="relative max-w-xl py-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">{isArabic ? "التعليم والرعاية" : "Éducation & accompagnement"}</p>
          <h3 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">{isDaara ? copy.daaraHeadline : copy.schoolHeadline}</h3>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/75">{isDaara ? copy.daaraBody : copy.schoolBody}</p>
        </div>
        <div className="relative flex items-center gap-2 text-sm text-white/65"><CheckCircle2 className="h-4 w-4" />{isArabic ? "بياناتك محمية وتُدار بأمان." : "Vos données sont protégées et gérées en toute sécurité."}</div>
      </aside>
      <style jsx>{`
        .auth-input { width: 100%; height: 48px; border: 1px solid hsl(var(--input)); border-radius: 0.75rem; background: hsl(var(--background)); padding: 0 2.75rem; color: hsl(var(--foreground)); font-size: 0.875rem; outline: none; transition: border-color 150ms, box-shadow 150ms; }
        .auth-input:focus { border-color: hsl(var(--primary)); box-shadow: 0 0 0 3px hsl(var(--primary) / 0.12); }
        .auth-input::placeholder { color: hsl(var(--muted-foreground) / 0.72); }
      `}</style>
    </main>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-semibold">{label}</span><span className="relative flex items-center text-muted-foreground"><span className="pointer-events-none absolute left-3.5">{icon}</span>{children}</span></label>;
}

function GoogleMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;
}
