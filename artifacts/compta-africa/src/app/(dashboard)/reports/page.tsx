"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const MOCK_MONTHLY_REPORTS = [
  { month: "Janvier", revenue: 1500000, expenses: 600000, profit: 900000, transactionCount: 12 },
  { month: "Février", revenue: 1800000, expenses: 750000, profit: 1050000, transactionCount: 15 },
  { month: "Mars", revenue: 1650000, expenses: 700000, profit: 950000, transactionCount: 10 },
  { month: "Avril", revenue: 2100000, expenses: 900000, profit: 1200000, transactionCount: 18 },
  { month: "Mai", revenue: 2450000, expenses: 850000, profit: 1600000, transactionCount: 22 },
];

const MOCK_SUMMARY = {
  profitMargin: 65,
  bestMonth: "Mai",
  worstMonth: "Janvier",
};

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rapports</h1>
        <p className="text-muted-foreground mt-1">Analyse détaillée de vos performances ({currentYear}).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Marge Nette</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-3xl font-bold text-primary">{MOCK_SUMMARY.profitMargin}%</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Meilleur Mois</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-32" /> : (
              <div className="text-xl font-bold capitalize">{MOCK_SUMMARY.bestMonth}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mois le plus faible</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-32" /> : (
              <div className="text-xl font-bold capitalize">{MOCK_SUMMARY.worstMonth}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-none shadow-xl bg-card/50">
        <CardHeader>
          <CardTitle>Revenus vs Dépenses</CardTitle>
          <CardDescription>Analyse mensuelle détaillée pour l'année {currentYear}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <div className="h-[400px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_MONTHLY_REPORTS} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(val) => `${val / 1000}k`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="revenue" name="Revenus" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="expenses" name="Dépenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Données Mensuelles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Mois</th>
                  <th className="px-6 py-4 font-medium text-right">Revenus</th>
                  <th className="px-6 py-4 font-medium text-right">Dépenses</th>
                  <th className="px-6 py-4 font-medium text-right">Bénéfice</th>
                  <th className="px-6 py-4 font-medium text-right">Opérations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24 ml-auto" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24 ml-auto" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24 ml-auto" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-10 ml-auto" /></td>
                    </tr>
                  ))
                ) : (
                  MOCK_MONTHLY_REPORTS.map((report) => (
                    <tr key={report.month} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium capitalize">{report.month}</td>
                      <td className="px-6 py-4 text-right text-primary">{formatCurrency(report.revenue)}</td>
                      <td className="px-6 py-4 text-right text-destructive">{formatCurrency(report.expenses)}</td>
                      <td className="px-6 py-4 text-right font-bold">{formatCurrency(report.profit)}</td>
                      <td className="px-6 py-4 text-right text-muted-foreground">{report.transactionCount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
