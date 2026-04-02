import { useGetClient } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ArrowRightLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useRoute } from "wouter";

export default function ClientDetail() {
  const [, params] = useRoute("/clients/:id");
  const clientId = params?.id ? parseInt(params.id, 10) : 0;

  const { data: client, isLoading } = useGetClient(clientId, {
    query: {
      enabled: !!clientId,
      queryKey: ["getClient", clientId]
    }
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-1" />
          <Skeleton className="h-96 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto text-center py-20">
        <h2 className="text-xl font-bold">Client introuvable</h2>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/clients">Retour aux clients</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <Button asChild variant="ghost" className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/clients">
          <span className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour aux clients
          </span>
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            Client depuis {formatDate(client.createdAt)}
          </div>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-right w-fit">
          <div className="text-xs uppercase tracking-wider font-semibold mb-1">Total généré</div>
          <div className="text-2xl font-bold">{formatCurrency(client.totalPaid)}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Mail className="w-4 h-4" />
              </div>
              <span className="break-all">{client.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Phone className="w-4 h-4" />
              </div>
              <span>{client.phone}</span>
            </div>
            {client.address && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>{client.address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
              Historique des transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {client.transactions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Aucune transaction pour ce client.
              </div>
            ) : (
              <div className="space-y-0 border rounded-lg divide-y">
                {client.transactions?.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-4 hover:bg-muted/30 transition-colors">
                    <div>
                      <div className="font-medium">{tx.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(tx.date)} • {tx.category}
                      </div>
                    </div>
                    <div className={`font-bold ${tx.type === 'revenue' ? 'text-primary' : 'text-destructive'}`}>
                      {tx.type === 'revenue' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
