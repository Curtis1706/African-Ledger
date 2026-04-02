"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const CATEGORIES = {
  transport: "Transport",
  stock: "Achat Stock",
  loyer: "Loyer",
  salaires: "Salaires",
  marketing: "Marketing",
  utilitaires: "Électricité / Eau",
  autre: "Autre"
} as const;

type CategoryKey = keyof typeof CATEGORIES;

const expenseSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  description: z.string().min(2, "La description est requise"),
  amount: z.coerce.number().min(1, "Le montant doit être supérieur à 0"),
  category: z.enum(["transport", "stock", "loyer", "salaires", "marketing", "utilitaires", "autre"] as const),
});

type Expense = {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: CategoryKey;
};

const MOCK_EXPENSES: Expense[] = [
  { id: 1, date: "2026-04-01", description: "Loyer bureau Avril", amount: 200000, category: "loyer" },
  { id: 2, date: "2026-03-28", description: "Carburant camion", amount: 45000, category: "transport" },
  { id: 3, date: "2026-03-25", description: "Facture Senelec", amount: 35000, category: "utilitaires" },
  { id: 4, date: "2026-03-20", description: "Achat stock boissons", amount: 120000, category: "stock" },
  { id: 5, date: "2026-03-15", description: "Publicité Facebook", amount: 50000, category: "marketing" },
];

const MOCK_CATEGORY_TOTALS = [
  { category: "loyer", total: 200000, percentage: 44 },
  { category: "stock", total: 120000, percentage: 27 },
  { category: "marketing", total: 50000, percentage: 11 },
  { category: "transport", total: 45000, percentage: 10 },
  { category: "utilitaires", total: 35000, percentage: 8 },
];

export default function ExpensesPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExpenses(MOCK_EXPENSES);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      description: "",
      amount: 0,
      category: "autre",
    }
  });

  const onSubmit = (data: z.infer<typeof expenseSchema>) => {
    const newExpense: Expense = {
      id: Date.now(),
      ...data
    };
    setExpenses([newExpense, ...expenses]);
    toast.success("Dépense enregistrée (Simulation)");
    setIsAddOpen(false);
    form.reset();
  };

  const filteredExpenses = expenses.filter(e => categoryFilter === "all" || e.category === categoryFilter);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dépenses</h1>
          <p className="text-muted-foreground mt-1">Suivez les charges de votre entreprise.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-expense">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Dépense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une dépense</DialogTitle>
              <DialogDescription>Enregistrez une nouvelle charge pour l'entreprise.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(CATEGORIES).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Achat de..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant (FCFA)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="mt-6">
                  <Button type="submit">Enregistrer</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Par Catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {MOCK_CATEGORY_TOTALS.map(cat => (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{CATEGORIES[cat.category as CategoryKey] || cat.category}</span>
                        <span className="font-bold">{formatCurrency(cat.total)}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-destructive" 
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground text-right">{Math.round(cat.percentage)}%</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 bg-card p-2 px-4 rounded-xl border shadow-sm">
            <Filter className="w-4 h-4 text-muted-foreground ml-2" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px] border-none shadow-none focus:ring-0">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Description</th>
                    <th className="px-6 py-4 font-medium">Catégorie</th>
                    <th className="px-6 py-4 font-medium text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24 ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        Aucune dépense trouvée.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                            {CATEGORIES[expense.category] || expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap font-bold text-destructive">
                          - {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
