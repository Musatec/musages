"use client";

import { SearchCenter } from "@/components/layout/search-center";
import { SpaceSwitcher } from "@/components/layout/space-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";

export function EliteHeader() {
    const locale = useLocale();
    const { data: session } = useSession();

    return (
        <header
            dir={locale === "ar" ? "rtl" : "ltr"}
            className="sticky top-0 z-40 hidden h-[72px] w-full border-b border-border/70 bg-background/90 px-6 backdrop-blur-xl md:flex md:items-center lg:px-8"
        >
            <div className="mx-auto flex w-full max-w-[1600px] items-center gap-5">
                <SpaceSwitcher />
                <div className="mx-auto hidden w-full max-w-[520px] lg:block">
                    <SearchCenter />
                </div>
                <div className="ms-auto flex shrink-0 items-center gap-3" aria-label={session?.user?.name || "Compte utilisateur"}>
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
