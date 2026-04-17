"use client";

import { useState } from "react";
import { MessageSquarePlus, Star, X, Loader2, Send, Bug, Sparkles, Lightbulb, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitFeedback } from "@/lib/actions/feedback";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { id: "GENERAL", label: "Général", icon: MessageCircle, color: "text-blue-500" },
    { id: "BUG", label: "Bug", icon: Bug, color: "text-red-500" },
    { id: "FEATURE", label: "Fonctionnalité", icon: Sparkles, color: "text-primary" },
    { id: "SUGGESTION", label: "Suggestion", icon: Lightbulb, color: "text-amber-500" },
];

export function FeedbackButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [category, setCategory] = useState<string>("GENERAL");
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Veuillez donner une note.");
            return;
        }
        if (comment.length < 5) {
            toast.error("Le commentaire est trop court.");
            return;
        }

        setLoading(true);
        const result = await submitFeedback({
            rating,
            category: category as any,
            comment
        });

        if (result.success) {
            toast.success(result.message);
            setIsOpen(false);
            setRating(0);
            setComment("");
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 md:right-10 z-50 w-14 h-14 bg-primary text-black rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
            >
                <MessageSquarePlus className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping opacity-20" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                        />
                        
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0A0A0B] border border-white/5 rounded-[2.5rem] shadow-2xl p-8 md:p-10 overflow-hidden"
                        >
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[100px] rounded-full -mr-16 -mt-16" />

                            <div className="flex justify-between items-start relative z-10 mb-8">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary italic">
                                        Surveys & Feedback
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tighter uppercase italic italic">
                                        VOTRE AVIS <br />
                                        <span className="text-gray-500 font-bold text-xl uppercase tracking-widest">NOUS FAIT GRANDIR.</span>
                                    </h2>
                                </div>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-8 relative z-10">
                                {/* Rating Section */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Expérience avec MINDOS</label>
                                    <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className="transition-transform active:scale-90"
                                            >
                                                <Star 
                                                    className={cn(
                                                        "w-8 h-8 transition-all duration-300",
                                                        rating >= star ? "fill-primary text-primary scale-110 drop-shadow-[0_0_10px_rgba(234,88,12,0.5)]" : "text-gray-800"
                                                    )} 
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Section */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Type de retour</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {CATEGORIES.map((cat) => {
                                            const Icon = cat.icon;
                                            const isActive = category === cat.id;
                                            return (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setCategory(cat.id)}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-2xl border transition-all text-left group",
                                                        isActive 
                                                            ? "bg-white/10 border-white/20" 
                                                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                                    )}
                                                >
                                                    <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive ? cat.color : "text-gray-700")} />
                                                    <span className={cn("text-[10px] font-black uppercase tracking-widest italic", isActive ? "text-white" : "text-gray-600")}>
                                                        {cat.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Comment Section */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Commentaire (votre génie ici)</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Dites-nous tout..."
                                        rows={4}
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-[12px] font-bold text-white placeholder:text-gray-800 focus:outline-none focus:border-primary/50 transition-all resize-none italic"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={cn(
                                        "w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 transition-all",
                                        loading 
                                            ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                                            : "bg-primary text-black shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95"
                                    )}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            Soumettre le Feedback
                                            <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
