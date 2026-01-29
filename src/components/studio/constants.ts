
import {
    Link as LinkIcon, Terminal, Lightbulb, Sparkles, Image as ImageIcon
} from "lucide-react";
import { CategoryConfig } from "@/types/studio";

export const CATEGORIES: (CategoryConfig & { description: string })[] = [
    { id: "idea", label: "Idée", icon: Lightbulb, color: "text-amber-400", ring: "ring-amber-500/20", description: "Une étincelle créative." },
    { id: "link", label: "Lien", icon: LinkIcon, color: "text-orange-400", ring: "ring-orange-500/20", description: "Une ressource web à garder." },
    { id: "image", label: "Image", icon: ImageIcon, color: "text-red-400", ring: "ring-red-500/20", description: "Une inspiration visuelle." },
    { id: "prompt", label: "Prompt", icon: Terminal, color: "text-stone-400", ring: "ring-stone-500/20", description: "Une commande pour l'IA." },
    { id: "tip", label: "Astuce", icon: Sparkles, color: "text-yellow-400", ring: "ring-yellow-500/20", description: "Un conseil ou un hack utile." },
];
