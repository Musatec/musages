"use client";

import { Server, Lock } from "lucide-react";
import { toast } from "sonner";

export function AdminControls() {
    const handleAction = (name: string) => {
        toast.info(`Initialisation de ${name}...`, {
            description: "Fonctionnalité en cours de déploiement sur les serveurs MindOS.",
            duration: 4000
        });
    };

    return (
        <div className="space-y-3">
            <button 
                onClick={() => handleAction("Sauvegarde Cloud")}
                className="w-full py-5 bg-black/20 backdrop-blur-xl border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic text-white flex items-center justify-between px-8 hover:bg-black/40 transition-all active:scale-95"
            >
                Sauvegarde Cloud <Server className="w-4 h-4 opacity-40" />
            </button>
            <button 
                onClick={() => handleAction("Mode Maintenance")}
                className="w-full py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic flex items-center justify-between px-8 hover:scale-[1.02] active:scale-95 transition-all"
            >
                Mode Maintenance <Lock className="w-4 h-4" />
            </button>
        </div>
    );
}
