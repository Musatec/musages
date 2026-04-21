"use client";

import { 
    Bell, 
    ShoppingCart, 
    AlertTriangle, 
    Zap, 
    Info, 
    CheckCircle2, 
    Clock,
    Loader2
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function NotificationCenter() {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const { notifications, loading, markAsRead, markAllAsRead } = useNotifications(userId);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="relative p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all group active:scale-95">
                    <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse"></span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md bg-[#050505] border-l border-white/10 p-0 flex flex-col">
                <SheetHeader className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                            <Bell className="w-5 h-5 text-primary" />
                            CENTRE DE COMMANDES
                        </SheetTitle>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-bold px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg uppercase tracking-widest">
                                {unreadCount} Nouvelle{unreadCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 opacity-50">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Synchronisation...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 opacity-30">
                            <Bell className="w-12 h-12" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Aucune notification</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                onClick={() => !notif.isRead && markAsRead(notif.id)}
                                className={cn(
                                    "p-6 border-b border-white/[0.03] transition-all hover:bg-white/[0.02] cursor-pointer group relative overflow-hidden",
                                    !notif.isRead && "bg-primary/[0.01]"
                                )}
                            >
                                {!notif.isRead && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                )}
                                
                                <div className="flex gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-110",
                                        notif.type === 'ALERT' && "bg-red-500/10 border-red-500/20 text-red-500",
                                        notif.type === 'SALE' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                                        notif.type === 'SUCCESS' && "bg-primary/10 border-primary/20 text-primary",
                                        notif.type === 'INFO' && "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                    )}>
                                        {notif.type === 'ALERT' && <AlertTriangle className="w-5 h-5" />}
                                        {notif.type === 'SALE' && <ShoppingCart className="w-5 h-5" />}
                                        {notif.type === 'SUCCESS' && <CheckCircle2 className="w-5 h-5" />}
                                        {notif.type === 'INFO' && <Info className="w-5 h-5" />}
                                    </div>

                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">
                                                {notif.title}
                                            </h4>
                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest italic opacity-50">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                            {notif.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {unreadCount > 0 && (
                    <div className="p-6 bg-white/[0.02] border-t border-white/5">
                        <button 
                            onClick={() => markAllAsRead()}
                            className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all italic flex items-center justify-center gap-2"
                        >
                            Marquer tout comme lu
                            <Zap className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

