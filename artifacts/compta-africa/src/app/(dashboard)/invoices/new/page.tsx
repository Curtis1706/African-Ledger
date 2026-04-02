"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const MOCK_CLIENTS = [
  { id: 1, name: "Moussa Diop" },
  { id: 2, name: "Fatou Traoré" },
  { id: 3, name: "Entreprise Sahel" },
  { id: 4, name: "Boutique Union" },
];

export default function NewInvoicePage() {
  const router = useRouter();
  const [clientId, setClientId] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [items, setItems] = useState([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const total = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast.error("Veuillez sélectionner un client");
      return;
    }
    
    const validItems = items.filter(item => item.description && item.quantity > 0 && item.unitPrice > 0);
    if (validItems.length === 0) {
      toast.error("Veuillez ajouter au moins une ligne valide");
      return;
    }

    toast.success("Facture créée avec succès (Simulation)");
    router.push("/invoices");
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/invoices">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouvelle Facture</h1>
          <p className="text-muted-foreground mt-1">Créez une facture à envoyer à votre client.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_CLIENTS.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Échéance</label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lignes de facture</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" /> Ajouter une ligne
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="hidden sm:grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground mb-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-right">Quantité</div>
                <div className="col-span-2 text-right">Prix Unitaire</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              
              {items.map((item, index) => (
                <div key={index} className="grid sm:grid-cols-12 gap-4 items-center border-b sm:border-b-0 pb-4 sm:pb-0">
                  <div className="sm:col-span-6">
                    <label className="text-xs text-muted-foreground sm:hidden">Description</label>
                    <Input 
                      placeholder="Description du produit ou service"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-1 sm:col-span-2 gap-4 sm:gap-0">
                    <div>
                      <label className="text-xs text-muted-foreground sm:hidden">Quantité</label>
                      <Input 
                        type="number" 
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        className="text-right"
                        required
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-muted-foreground sm:hidden">Prix Unitaire</label>
                    <Input 
                      type="number" 
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                      className="text-right"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                    <span className="font-medium">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4 border-t mt-4">
                <div className="w-full sm:w-1/3 space-y-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/invoices">
                Annuler
              </Link>
            </Button>
            <Button type="submit">
              Créer la facture
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
