"use client";

import * as React from "react";
import { 
    Search, 
    ShoppingCart, 
    Package, 
    User, 
    FileText, 
    Settings,
    Command as CommandIcon,
    ArrowRight,
    Loader2
} from "lucide-react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { globalSearch } from "@/lib/actions/search";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function SearchCenter() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Fermer si clic à l'extérieur
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Raccourci clavier ⌘K / Ctrl+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Recherche en temps réel (Debounced)
    React.useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const handler = setTimeout(async () => {
            setLoading(true);
            const res = await globalSearch(query);
            if (res.results) setResults(res.results);
            setLoading(false);
        }, 300);

        return () => clearTimeout(handler);
    }, [query]);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        setQuery("");
        command();
    }, []);

    return (
        <div className="flex-1 max-w-xl relative" ref={containerRef}>
            {/* Visual Search Bar - The Trigger */}
            <div className={cn(
                "flex items-center gap-2 px-2 md:px-4 py-2 bg-muted/30 border rounded-xl transition-all group",
                open ? "border-primary ring-2 ring-primary/10 bg-background" : "border-border/50 hover:bg-muted/50"
            )}>
                <Search className={cn("w-4 h-4 transition-colors shrink-0", open ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                <input 
                    placeholder="Rechercher..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!open) setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    className="flex-1 bg-transparent border-none outline-none text-[11px] md:text-sm font-medium text-white placeholder:text-muted-foreground/50 min-w-0"
                />
                {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                ) : (
                    <div className="hidden md:flex items-center gap-1 opacity-30 group-hover:opacity-60 transition-opacity shrink-0">
                        <span className="px-1.5 py-0.5 border border-border rounded text-[9px] font-bold bg-muted">⌘</span>
                        <span className="px-1.5 py-0.5 border border-border rounded text-[9px] font-bold bg-muted">K</span>
                    </div>
                )}
            </div>

            {/* Results Dropdown (No Modal Backdrop) */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mt-3 bg-background border border-border rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden z-[100] backdrop-blur-2xl"
                    >
                        <Command className="flex flex-col h-full">
                            <Command.List className="max-h-[60vh] overflow-y-auto p-2 no-scrollbar">
                                <Command.Empty className="py-8 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="w-6 h-6 text-primary/20" />
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            {query.length < 2 ? "Tapez au moins 2 caractères..." : "Aucun résultat trouvé."}
                                        </p>
                                    </div>
                                </Command.Empty>

                                {/* Résultats de recherche dynamique */}
                                {results.length > 0 && (
                                    <Command.Group heading="Résultats de recherche" className="px-2 py-3">
                                        {results.map((res) => (
                                            <CommandItem 
                                                key={res.id}
                                                onSelect={() => runCommand(() => router.push(res.href))}
                                                icon={res.type === "PRODUCT" ? Package : ShoppingCart}
                                                title={res.title}
                                                subtitle={res.subtitle}
                                            />
                                        ))}
                                    </Command.Group>
                                )}

                                {/* Actions Rapides Par Défaut */}
                                <Command.Group heading="Accès Rapide" className="px-2 py-3 border-t border-border mt-2">
                                    <CommandItem 
                                        onSelect={() => runCommand(() => router.push('/sales'))}
                                        icon={ShoppingCart}
                                        title="Nouvelle Vente"
                                        subtitle="Terminal POS"
                                    />
                                    <CommandItem 
                                        onSelect={() => runCommand(() => router.push('/inventory'))}
                                        icon={Package}
                                        title="Inventaire"
                                        subtitle="Stocks et produits"
                                    />
                                    <CommandItem 
                                        onSelect={() => runCommand(() => router.push('/settings'))}
                                        icon={Settings}
                                        title="Configuration"
                                        subtitle="Paramètres système"
                                    />
                                </Command.Group>
                            </Command.List>

                            {/* Footer Info */}
                            <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between px-6">
                                <div className="flex items-center gap-4 text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                    <span>↑↓ Naviguer</span>
                                    <span>↵ Choisir</span>
                                </div>
                                <span className="text-[8px] font-black text-primary/60 italic uppercase tracking-widest">MINDOS Search</span>
                            </div>
                        </Command>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function CommandItem({ icon: Icon, title, subtitle, onSelect }: any) {
    return (
        <Command.Item 
            onSelect={onSelect}
            className="flex items-center gap-4 p-3 rounded-2xl cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary transition-all group border border-transparent aria-selected:border-primary/20"
        >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-aria-selected:bg-primary group-aria-selected:text-black transition-all">
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col flex-1">
                <span className="text-[11px] font-black uppercase tracking-widest italic transition-colors text-foreground group-aria-selected:text-primary">
                    {title}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                    {subtitle}
                </span>
            </div>
            <ArrowRight className="w-4 h-4 opacity-0 group-aria-selected:opacity-100 transition-all -translate-x-2 group-aria-selected:translate-x-0" />
        </Command.Item>
    );
}

