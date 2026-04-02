"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatShortDate } from "@/lib/format";
import { ArrowUpRight, ArrowDownRight, Activity, Bell, FileText, ArrowRightLeft, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useState, useEffect } from "react";

// Mock data as backend is not implemented yet
const MOCK_SUMMARY = {
  totalRevenue: 2450000,
  totalExpenses: 850000,
  netProfit: 1600000,
  revenueGrowth: 12.5,
  expensesGrowth: -5.2,
  profitGrowth: 18.3,
  pendingInvoices: 5,
  totalClients: 24,
};

const MOCK_CHART_DATA = [
  { month: "Jan", revenue: 1500000, expenses: 600000, profit: 900000 },
  { month: "Fév", revenue: 1800000, expenses: 750000, profit: 1050000 },
  { month: "Mar", revenue: 1650000, expenses: 700000, profit: 950000 },
  { month: "Avr", revenue: 2100000, expenses: 900000, profit: 1200000 },
  { month: "Mai", revenue: 2450000, expenses: 850000, profit: 1600000 },
];

const MOCK_ACTIVITY = [
  { id: 1, type: "transaction", description: "Paiement client #1024", amount: 150000, date: "2026-04-02", category: "Vente" },
  { id: 2, type: "invoice", description: "Nouvelle facture #1025", amount: 250000, date: "2026-04-01", category: "Services" },
  { id: 3, type: "transaction", description: "Achat fournitures bureau", amount: 45000, date: "2026-03-31", category: "Fournitures" },
];

const MOCK_ALERTS = [
  { id: 1, type: "warning", title: "Factures en retard", message: "3 factures sont en retard de paiement." },
  { id: 2, type: "info", title: "Factures à échéance", message: "2 factures arrivent à échéance cette semaine." },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Aperçu de vos finances pour le mois en cours.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Chiffre d'affaires"
          value={MOCK_SUMMARY.totalRevenue}
          growth={MOCK_SUMMARY.revenueGrowth}
          isLoading={loading}
        />
        <KpiCard
          title="Dépenses"
          value={MOCK_SUMMARY.totalExpenses}
          growth={MOCK_SUMMARY.expensesGrowth}
          isLoading={loading}
          invertColors
        />
        <KpiCard
          title="Bénéfice Net"
          value={MOCK_SUMMARY.netProfit}
          growth={MOCK_SUMMARY.profitGrowth}
          isLoading={loading}
        />
        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80">Factures en attente</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20 bg-primary-foreground/20" />
            ) : (
              <div className="text-2xl font-bold">{MOCK_SUMMARY.pendingInvoices}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Évolution Financière</CardTitle>
            <CardDescription>Revenus et dépenses sur les derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area type="monotone" dataKey="revenue" name="Revenus" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="expenses" name="Dépenses" stroke="hsl(var(--destructive))" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Alertes & Conseils
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : MOCK_ALERTS.length ? (
              <div className="space-y-4">
                {MOCK_ALERTS.map((alert) => (
                  <div key={alert.id} className="p-4 rounded-lg bg-muted/50 border border-border/50 text-sm">
                    <div className="font-semibold flex items-center gap-2 mb-1">
                      {alert.type === 'warning' && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                      {alert.type === 'info' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                      {alert.title}
                    </div>
                    <div className="text-muted-foreground">{alert.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Aucune alerte pour le moment. Tout va bien !</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : MOCK_ACTIVITY.length ? (
            <div className="space-y-0">
              {MOCK_ACTIVITY.map((activity, i) => {
                let Icon = Activity;
                if (activity.type === 'transaction') Icon = ArrowRightLeft;
                if (activity.type === 'invoice') Icon = FileText;
                if (activity.type === 'client') Icon = Users;

                return (
                  <div key={activity.id} className={`flex items-center justify-between p-4 ${i !== MOCK_ACTIVITY.length - 1 ? 'border-b' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{activity.description}</div>
                        <div className="text-xs text-muted-foreground">{formatShortDate(activity.date)} {activity.category && `• ${activity.category}`}</div>
                      </div>
                    </div>
                    {activity.amount != null && (
                      <div className="font-semibold text-sm">
                        {formatCurrency(activity.amount)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Aucune activité récente.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, growth, isLoading, invertColors = false }: { title: string, value?: number, growth?: number, isLoading: boolean, invertColors?: boolean }) {
  const isPositiveGrowth = (growth || 0) >= 0;
  const isGood = invertColors ? !isPositiveGrowth : isPositiveGrowth;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-16" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold tracking-tight">
              {formatCurrency(value || 0)}
            </div>
            {growth != null && (
              <div className={`flex items-center text-xs mt-1 ${isGood ? 'text-primary' : 'text-destructive'}`}>
                {isPositiveGrowth ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                <span>{Math.abs(growth)}% par rapport au mois dernier</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
