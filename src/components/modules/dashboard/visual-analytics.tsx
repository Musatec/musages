
"use client";

import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { SafeImage } from '@/components/ui/safe-image';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopProduct {
    name: string;
    image: string | null;
    quantity: number;
    revenue: number;
}

export function VisualAnalytics({ products }: { products: TopProduct[] }) {
    // Sort and format data for charts
    const chartData = products.map(p => ({
        name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
        fullName: p.name,
        sales: p.quantity,
        revenue: p.revenue,
        image: p.image
    })).sort((a, b) => b.sales - a.sales);

    const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#6366f1'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* TOP PRODUCTS BAR CHART */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="font-bold text-foreground">Top 5 Produits (Volume)</h3>
                        <p className="text-xs text-muted-foreground mt-1">Articles les plus vendus ce mois</p>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {chartData.map((item, index) => (
                        <div key={item.fullName} className="group flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-muted border border-border overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-110">
                                {item.image ? (
                                    <SafeImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                        <Package className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[11px] font-black uppercase tracking-tight truncate max-w-[150px]">{item.fullName}</span>
                                    <span className="text-[10px] font-black text-primary italic">{item.sales} UNITÉS</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ 
                                            width: `${(item.sales / Math.max(...chartData.map(d => d.sales))) * 100}%`,
                                            backgroundColor: COLORS[index % COLORS.length]
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {chartData.length === 0 && (
                        <div className="py-10 text-center text-xs italic text-muted-foreground">Pas encore de données de vente.</div>
                    )}
                </div>
            </div>

            {/* REVENUE SHARE (PIE CHART) */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="mb-6">
                    <h3 className="font-bold text-foreground">Répartition du Chiffre d'Affaires</h3>
                    <p className="text-xs text-muted-foreground mt-1">Part de revenus par produit star</p>
                </div>
                
                <div className="flex-1 min-h-[250px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="revenue"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: any) => [`${new Intl.NumberFormat('fr-FR').format(Number(value))} F`, 'Revenu']}
                                />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                    {chartData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase truncate">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
