
import React from "react";
import { cn } from "@/lib/utils";

interface ElitePageHeaderProps {
    title: string;
    subtitle?: string;
    description?: string;
    actions?: React.ReactNode;
    icon?: React.ElementType;
    className?: string;
}

export function ElitePageHeader({
    title,
    subtitle,
    description,
    actions,
    icon: Icon,
    className
}: ElitePageHeaderProps) {
    return (
        <header className={cn("flex flex-col md:flex-row md:items-end justify-between gap-8 pb-6 border-b border-border/40 mb-6", className)}>
            <div className="space-y-1">
                {subtitle && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="w-8 h-0.5 bg-primary rounded-full shadow-[0_0_12px_rgba(var(--primary-rgb),0.4)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">
                            {subtitle}
                        </span>
                    </div>
                )}
                
                <div className="flex items-center gap-4">
                    {Icon && (
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl hidden md:flex">
                            <Icon className="w-6 h-6 text-primary" />
                        </div>
                    )}
                    <div className="space-y-0.5">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase text-foreground leading-none">
                            {title.split(' ').map((word, i) => (
                                <span key={i} className={i % 2 === 1 ? "text-primary italic" : ""}>
                                    {word}{' '}
                                </span>
                            ))}
                        </h1>
                        {description && (
                            <p className="text-sm text-muted-foreground font-medium max-w-2xl">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {actions && (
                <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-700">
                    {actions}
                </div>
            )}
        </header>
    );
}
