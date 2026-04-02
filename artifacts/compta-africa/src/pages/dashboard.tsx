import { useGetDashboardSummary, useGetDashboardChart, useGetDashboardRecentActivity, useGetDashboardAlerts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { ArrowUpRight, ArrowDownRight, Activity, Bell, FileText, ArrowRightLeft, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatShortDate } from "@/lib/format";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: chartData, isLoading: isLoadingChart } = useGetDashboardChart();
  const { data: recentActivity, isLoading: isLoadingActivity } = useGetDashboardRecentActivity();
  const { data: alerts, isLoading: isLoadingAlerts } = useGetDashboardAlerts();

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
          value={summary?.totalRevenue}
          growth={summary?.revenueGrowth}
          isLoading={isLoadingSummary}
        />
        <KpiCard
          title="Dépenses"
          value={summary?.totalExpenses}
          growth={summary?.expensesGrowth}
          isLoading={isLoadingSummary}
          invertColors
        />
        <KpiCard
          title="Bénéfice Net"
          value={summary?.netProfit}
          growth={summary?.profitGrowth}
          isLoading={isLoadingSummary}
        />
        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80">Factures en attente</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-20 bg-primary-foreground/20" />
            ) : (
              <div className="text-2xl font-bold">{summary?.pendingInvoices || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Évolution Financière</CardTitle>
            <CardDescription>Revenus et dépenses sur les 12 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingChart ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            {isLoadingAlerts ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : alerts?.length ? (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4 rounded-lg bg-muted/50 border border-border/50 text-sm">
                    <div className="font-semibold flex items-center gap-2 mb-1">
                      {alert.type === 'warning' && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                      {alert.type === 'error' && <div className="w-2 h-2 rounded-full bg-destructive" />}
                      {alert.type === 'success' && <div className="w-2 h-2 rounded-full bg-primary" />}
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
          {isLoadingActivity ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recentActivity?.length ? (
            <div className="space-y-0">
              {recentActivity.map((activity, i) => {
                let Icon = Activity;
                if (activity.type === 'transaction') Icon = ArrowRightLeft;
                if (activity.type === 'invoice') Icon = FileText;
                if (activity.type === 'client') Icon = Users;

                return (
                  <div key={activity.id} className={`flex items-center justify-between p-4 ${i !== recentActivity.length - 1 ? 'border-b' : ''}`}>
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
