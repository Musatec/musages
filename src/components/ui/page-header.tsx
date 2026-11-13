
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
        <header className={cn("flex flex-col md:flex-row md:items-end justify-between gap-5 pb-5 border-b border-border/70 mb-6", className)}>
            <div className="space-y-2">
                {subtitle && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                        <span className="app-eyebrow">
                            {subtitle}
                        </span>
                    </div>
                )}
                
                <div className="flex items-center gap-4">
                    {Icon && (
                        <div className="p-3 bg-primary/10 border border-primary/15 rounded-2xl hidden md:flex">
                            <Icon className="w-6 h-6 text-primary" />
                        </div>
                    )}
                    <div className="space-y-0.5">
                        <h1 className="app-page-title">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {actions && (
                <div className="flex flex-wrap items-center gap-2.5 md:justify-end w-full md:w-auto">
                    {actions}
                </div>
            )}
        </header>
    );
}
