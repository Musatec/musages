"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";

export function CredentialsView({ username, password }: { username: string | null, password: string | null }) {
    const t = useTranslations("Growth");
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    if (!username && !password) return null;

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="mt-4 pt-3 border-t border-border bg-accent/20 rounded-xl p-4 space-y-3 shadow-inner">
            {username && (
                <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground font-black uppercase tracking-widest">{t('id_label') || 'ID'}:</span>
                    <div className="flex items-center gap-3">
                        <span className="text-foreground font-mono select-all truncate max-w-[120px]" title={username}>
                            {username}
                        </span>
                        <button
                            onClick={() => handleCopy(username, 'user')}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {copied === 'user' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                    </div>
                </div>
            )}

            {password && (
                <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground font-black uppercase tracking-widest">{t('password_label')}:</span>
                    <div className="flex items-center gap-3">
                        <span className="text-foreground font-mono">
                            {showPassword ? password : "••••••••"}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                            <button
                                onClick={() => handleCopy(password, 'pass')}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {copied === 'pass' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
