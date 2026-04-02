"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowRightLeft, FileText, Users, Receipt, BarChart3, Settings as SettingsIcon, Menu, Bell, Search, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { path: "/invoices", label: "Factures", icon: FileText },
  { path: "/clients", label: "Clients", icon: Users },
  { path: "/expenses", label: "Dépenses", icon: Receipt },
  { path: "/reports", label: "Rapports", icon: BarChart3 },
  { path: "/settings", label: "Paramètres", icon: SettingsIcon },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.path);
        const Icon = item.icon;
        return (
          <Link key={item.path} href={item.path} onClick={onClick}>
            <span
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card/50 backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground">C</span>
            </div>
            ComptaAfrica
          </div>
        </div>
        <div className="flex-1 px-4 py-2 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary">MB</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Moussa Boutique</span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-6">
                  <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground">C</span>
                    </div>
                    ComptaAfrica
                  </div>
                </div>
                <div className="px-4 py-2">
                  <NavLinks onClick={() => setIsMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden md:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="h-9 w-64 rounded-md border border-border bg-muted/50 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all focus:w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
              <Link href="/transactions">
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nouveau
                </span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive border-2 border-background" />
            </Button>
            <div className="md:hidden">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">MB</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-muted/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
