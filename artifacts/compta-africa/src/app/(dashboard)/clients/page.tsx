"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Users, Mail, Phone, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const clientSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  address: z.string().optional(),
});

type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalPaid: number;
  transactionCount: number;
};

const MOCK_CLIENTS: Client[] = [
  { id: 1, name: "Moussa Diop", email: "moussa@diop.com", phone: "+221 77 123 45 67", address: "Dakar, Plateau", totalPaid: 1250000, transactionCount: 8 },
  { id: 2, name: "Fatou Traoré", email: "fatou@sahel.sn", phone: "+221 78 987 65 43", address: "Saint-Louis, Ndiolofène", totalPaid: 850000, transactionCount: 5 },
  { id: 3, name: "Entreprise Sahel", email: "contact@sahel.com", phone: "+221 33 800 00 00", address: "Dakar, Almadies", totalPaid: 5600000, transactionCount: 12 },
  { id: 4, name: "Boutique Union", email: "union@gmail.com", phone: "+221 70 555 44 33", address: "Thiès, Cité Lamy", totalPaid: 150000, transactionCount: 2 },
];

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClients(MOCK_CLIENTS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    }
  });

  const onSubmit = (data: z.infer<typeof clientSchema>) => {
    const newClient: Client = {
      id: Date.now(),
      ...data,
      totalPaid: 0,
      transactionCount: 0
    };
    setClients([newClient, ...clients]);
    toast.success("Client ajouté (Simulation)");
    setIsAddOpen(false);
    form.reset();
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Gérez votre répertoire de clients.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-client">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un client</DialogTitle>
              <DialogDescription>Saisissez les informations du nouveau client.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom / Entreprise</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+221 ..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse (optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="Dakar, Sénégal..." {...field} />
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

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Rechercher un client..." 
          className="pl-9 bg-muted/50 border-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p>Aucun client trouvé.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <Card className="hover:bg-muted/30 transition-colors cursor-pointer h-full border hover:border-primary/50 group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">{client.name}</div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                    {client.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t flex justify-between items-end">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Total payé</div>
                      <div className="font-bold text-primary">{formatCurrency(client.totalPaid)}</div>
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {client.transactionCount} opérations
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
