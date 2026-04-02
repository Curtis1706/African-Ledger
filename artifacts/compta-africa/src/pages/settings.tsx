import { useTheme } from "@/components/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  const handleSave = () => {
    toast.success("Paramètres enregistrés avec succès");
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Gérez vos préférences et votre profil.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profil Utilisateur</CardTitle>
            <CardDescription>Vos informations personnelles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'entreprise</Label>
              <Input id="name" defaultValue="Moussa Boutique" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="contact@moussaboutique.com" />
            </div>
            <Button onClick={handleSave}>Mettre à jour</Button>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Apparence</CardTitle>
              <CardDescription>Personnalisez l'interface de l'application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode Sombre</Label>
                  <p className="text-sm text-muted-foreground">Activer le thème sombre par défaut.</p>
                </div>
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  data-testid="switch-theme"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Gérez vos alertes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertes de paiement</Label>
                  <p className="text-sm text-muted-foreground">Recevoir un email quand une facture est en retard.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rapport hebdomadaire</Label>
                  <p className="text-sm text-muted-foreground">Un résumé de vos finances chaque lundi.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
