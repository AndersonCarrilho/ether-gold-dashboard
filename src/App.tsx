
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import Transactions from "./pages/Transactions";
import Tokens from "./pages/Tokens";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import HardhatSim from "./pages/HardhatSim";
import FinMT from "./pages/FinMT";
import FlashLoansPage from "./pages/FlashLoans"; // Import the new FlashLoans page
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  // Garantir que o tema escuro seja aplicado quando o aplicativo é carregado
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/send" element={<Send />} />
            <Route path="/receive" element={<Receive />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/tokens" element={<Tokens />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/hardhat" element={<HardhatSim />} />
            <Route path="/fin-mt" element={<FinMT />} />
            <Route path="/flashloans" element={<FlashLoansPage />} /> {/* Add route for FlashLoans */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
