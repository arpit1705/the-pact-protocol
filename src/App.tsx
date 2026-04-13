import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { useAppData } from "@/hooks/useAppData";
import Dashboard from "@/pages/Dashboard";
import PunishmentTracker from "@/pages/PunishmentTracker";
import History from "@/pages/History";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AppContent() {
  const data = useAppData();

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard data={data} />} />
        <Route path="/punishments" element={<PunishmentTracker data={data} />} />
        <Route path="/history" element={<History data={data} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
