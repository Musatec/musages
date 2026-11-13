
import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    variant: "orange" | "amber" | "red" | "emerald" | "blue" | "purple";
    sub?: string;
    className?: string;
}

const variants = {
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
};

export function EliteMetricCard({ 
    label, 
    value, 
    icon: Icon, 
    variant, 
    sub,
    className 
}: MetricCardProps) {
    return (
        <div className={cn(
            "relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/80 bg-card p-4 text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:gap-4",
            className
        )}>
            {/* Abstract Pattern Overlay */}
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", variants[variant])}>
                <Icon className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                <h3 className="mt-1 text-xl font-bold leading-none tracking-tight text-foreground">
                    {value}
                </h3>
                {sub && (
                    <p className="mt-1 text-[10px] font-medium text-muted-foreground">{sub}</p>
                )}
            </div>
        </div>
    );
}
