import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "@/components/layout/app-layout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Invoices from "@/pages/invoices";
import NewInvoice from "@/pages/new-invoice";
import Clients from "@/pages/clients";
import ClientDetail from "@/pages/client-detail";
import Expenses from "@/pages/expenses";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/transactions" component={Transactions} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/invoices/new" component={NewInvoice} />
        <Route path="/clients" component={Clients} />
        <Route path="/clients/:id" component={ClientDetail} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="comptaafrica-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
