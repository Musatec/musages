
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
    orange: "from-orange-500 to-orange-600 shadow-orange-500/20",
    amber: "from-amber-500 to-amber-600 shadow-amber-500/20",
    red: "from-red-500 to-red-600 shadow-red-500/20",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
    blue: "from-blue-500 to-blue-600 shadow-blue-500/20",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/20",
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
            "relative overflow-hidden rounded-2xl p-4 shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-none text-white", 
            "bg-gradient-to-br",
            variants[variant],
            className
        )}>
            {/* Abstract Pattern Overlay */}
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-2 -translate-y-2">
                <Icon className="w-16 h-16" />
            </div>

            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/20 backdrop-blur-md">
                <Icon className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{label}</p>
                <h3 className="text-xl font-black tracking-tight leading-none">
                    {value}
                </h3>
                {sub && (
                    <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest mt-1">{sub}</p>
                )}
            </div>
        </div>
    );
}
