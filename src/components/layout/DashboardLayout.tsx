
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  // Garantir que a aplicação está no modo escuro
  React.useEffect(() => {
    // Adiciona a classe 'dark' ao elemento HTML para ativar o tema escuro
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background dark">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
          <footer className="border-t border-border/50 p-4 text-center text-sm text-muted-foreground">
            <span className="gold-gradient">Ether Gold Dashboard</span> © {new Date().getFullYear()}
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
