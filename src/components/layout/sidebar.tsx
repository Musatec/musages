"use client";

import { cn } from "@/lib/utils";
import { LogOut, PanelLeftClose, UserRound, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Link, usePathname } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useSpace } from "@/components/providers/space-provider";
import { NAV_SECTIONS, SCHOOL_NAV_SECTIONS, SUPER_ADMIN_NAV } from "@/config/nav";
import { SafeImage } from "@/components/ui/safe-image";

export function Sidebar() {
    const locale = useLocale();
    const isAr = locale === "ar";
    const tSidebar = useTranslations("Sidebar");
    const { data: session } = useSession();
    const { activeSpace } = useSpace();
    const pathname = usePathname();
    const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

    const userRole = session?.user?.role || "SERIGNE_DAARA";
    const isSchool = activeSpace === "school";
    const userName = session?.user?.name || (isAr ? "المستخدم" : "Votre compte");
    const userImage = session?.user?.image;
    const currentNav = userRole === "SUPER_ADMIN"
        ? SUPER_ADMIN_NAV
        : isSchool
            ? SCHOOL_NAV_SECTIONS
            : NAV_SECTIONS;

    return (
        <>
            {mobileOpen && (
                <button
                    type="button"
                    aria-label={isAr ? "إغلاق القائمة" : "Fermer le menu"}
                    className="md:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[60]"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                dir={isAr ? "rtl" : "ltr"}
                className={cn(
                    "fixed inset-y-0 z-[70] flex flex-col border-border/10 bg-[linear-gradient(165deg,#173f32_0%,#12382d_48%,#102f27_100%)] text-white shadow-[0_24px_60px_-32px_rgba(10,35,25,0.6)] transition-[width,transform] duration-300 ease-out",
                    isAr ? "right-0 border-l" : "left-0 border-r",
                    mobileOpen
                        ? "translate-x-0 w-[292px]"
                        : isAr
                            ? "translate-x-full md:translate-x-0"
                            : "-translate-x-full md:translate-x-0",
                    collapsed ? "md:w-[84px]" : "md:w-[264px]",
                )}
            >
                <div className={cn("flex h-[76px] items-center gap-3 border-b border-white/[0.09] px-5", collapsed && !mobileOpen && "md:justify-center md:px-3")}>
                    <Link
                        href={userRole === "SUPER_ADMIN" ? "/admin" : "/dashboard"}
                        onClick={() => setMobileOpen(false)}
                        className="flex min-w-0 flex-1 items-center gap-3"
                        aria-label={isSchool ? "École Pathé Pogne" : "Daara Ibnoul Khayim"}
                    >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] p-1.5 shadow-inner">
                            <img
                                src={isSchool ? "/logo-pathe-pogne.png" : "/logo-daara-ibnoul-khayim.png"}
                                alt=""
                                className="h-full w-full object-contain"
                            />
                        </span>
                        {(!collapsed || mobileOpen) && (
                            <span className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-semibold tracking-tight text-white">
                                    {isSchool ? "Pathé Pogne" : "Ibnoul Khayim"}
                                </span>
                                <span className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-100/60">
                                    {isAr ? "إدارة المؤسسة" : "Espace de gestion"}
                                </span>
                            </span>
                        )}
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white md:hidden"
                        aria-label={isAr ? "إغلاق القائمة" : "Fermer le menu"}
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden rounded-xl border border-white/10 p-2 text-white/55 transition hover:bg-white/10 hover:text-white md:inline-flex"
                        aria-label={collapsed ? (isAr ? "توسيع القائمة" : "Déployer le menu") : (isAr ? "طي القائمة" : "Réduire le menu")}
                    >
                        <PanelLeftClose className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
                    </button>
                </div>

                <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-5">
                    {currentNav.map((section) => {
                        const visibleItems = section.items.filter((item) => !item.roles || item.roles.includes(userRole));
                        if (!visibleItems.length) return null;

                        return (
                            <section key={section.title}>
                                {(!collapsed || mobileOpen) && (
                                    <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/45">
                                        {isAr ? (section.titleAr || section.title) : section.title}
                                    </h2>
                                )}
                                <div className="space-y-1">
                                    {visibleItems.map((item) => {
                                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                        const label = isAr ? (item.labelAr || item.label) : item.label;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                title={collapsed && !mobileOpen ? label : undefined}
                                                aria-label={label}
                                                aria-current={isActive ? "page" : undefined}
                                                className={cn(
                                                    "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-all duration-150",
                                                    collapsed && !mobileOpen && "md:justify-center md:px-0",
                                                    isActive
                                                        ? "bg-white text-[#173f32] shadow-[0_7px_18px_-12px_rgba(0,0,0,0.4)]"
                                                        : "text-emerald-50/75 hover:bg-white/[0.08] hover:text-white",
                                                )}
                                            >
                                                <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-[#246248]" : "text-emerald-100/60 group-hover:text-emerald-100")} />
                                                {(!collapsed || mobileOpen) && <span className="truncate font-medium">{label}</span>}
                                                {isActive && (!collapsed || mobileOpen) && <span className="ms-auto h-1.5 w-1.5 rounded-full bg-[#c9a968]" />}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}
                </nav>

                <div className="border-t border-white/[0.09] p-3">
                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className={cn(
                            "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-white/65 transition hover:bg-rose-400/10 hover:text-rose-100",
                            collapsed && !mobileOpen && "md:justify-center md:px-0",
                        )}
                        title={collapsed && !mobileOpen ? tSidebar("logout") : undefined}
                    >
                        <LogOut className="h-[18px] w-[18px] shrink-0" />
                        {(!collapsed || mobileOpen) && <span className="font-medium">{tSidebar("logout")}</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
