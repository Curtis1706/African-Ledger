"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

type Invoice = {
  id: number;
  number: string;
  clientName: string;
  dueDate: string;
  status: InvoiceStatus;
  total: number;
};

const MOCK_INVOICES: Invoice[] = [
  { id: 1, number: "FA-2026-001", clientName: "Moussa Diop", dueDate: "2026-04-15", status: "sent", total: 150000 },
  { id: 2, number: "FA-2026-002", clientName: "Fatou Traoré", dueDate: "2026-04-10", status: "paid", total: 350000 },
  { id: 3, number: "FA-2026-003", clientName: "Entreprise Sahel", dueDate: "2026-03-25", status: "overdue", total: 500000 },
  { id: 4, number: "FA-2026-004", clientName: "Boutique Union", dueDate: "2026-04-20", status: "draft", total: 75000 },
];

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInvoices(MOCK_INVOICES);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleStatusChange = (id: number, status: InvoiceStatus) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status } : inv));
    toast.success(`Statut de la facture mis à jour : ${status} (Simulation)`);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "paid":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Payée</Badge>;
      case "sent":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Clock className="w-3 h-3 mr-1" /> Envoyée</Badge>;
      case "overdue":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><AlertCircle className="w-3 h-3 mr-1" /> En retard</Badge>;
      case "draft":
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border"><FileText className="w-3 h-3 mr-1" /> Brouillon</Badge>;
    }
  };

  const filteredInvoices = invoices.filter(inv => statusFilter === "all" || inv.status === statusFilter);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
          <p className="text-muted-foreground mt-1">Gérez vos factures clients et suivez les paiements.</p>
        </div>
        
        <Button asChild data-testid="button-add-invoice">
          <Link href="/invoices/new">
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle Facture
            </span>
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-muted/50 border-none">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="sent">Envoyée</SelectItem>
              <SelectItem value="paid">Payée</SelectItem>
              <SelectItem value="overdue">En retard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">N° Facture</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Date d'échéance</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Montant</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24 ml-auto" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Aucune facture trouvée.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      {invoice.number}
                    </td>
                    <td className="px-6 py-4">
                      {invoice.clientName}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold whitespace-nowrap">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Select 
                        value={invoice.status} 
                        onValueChange={(v) => handleStatusChange(invoice.id, v as InvoiceStatus)}
                      >
                        <SelectTrigger className="w-[130px] ml-auto h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="sent">Envoyée</SelectItem>
                          <SelectItem value="paid">Payée</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
