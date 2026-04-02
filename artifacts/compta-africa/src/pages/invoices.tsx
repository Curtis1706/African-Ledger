import { useState } from "react";
import { Link } from "wouter";
import { useListInvoices, useUpdateInvoice } from "@workspace/api-client-react";
import type { ListInvoicesStatus, UpdateInvoiceBodyStatus } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getListInvoicesQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

export default function Invoices() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ListInvoicesStatus | undefined>();

  const { data: invoices, isLoading } = useListInvoices({ 
    status: statusFilter 
  });

  const updateInvoice = useUpdateInvoice();

  const handleStatusChange = (id: number, status: UpdateInvoiceBodyStatus) => {
    updateInvoice.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast.success("Statut de la facture mis à jour");
        queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
      }
    });
  };

  const getStatusBadge = (status: string) => {
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
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v as ListInvoicesStatus)}>
            <SelectTrigger className="w-[180px] bg-muted/50 border-none">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
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
              {isLoading ? (
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
              ) : invoices?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Aucune facture trouvée.
                  </td>
                </tr>
              ) : (
                invoices?.map((invoice) => (
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
                        onValueChange={(v) => handleStatusChange(invoice.id, v as UpdateInvoiceBodyStatus)}
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
