import { QueryClient, QueryClientProvider, useIsFetching } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { useAppData } from "@/hooks/useAppData";
import { ActiveUserProvider } from "@/context/ActiveUserContext";
import Dashboard from "@/pages/Dashboard";
import PunishmentTracker from "@/pages/PunishmentTracker";
import History from "@/pages/History";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

function AppContent() {
  const data = useAppData();
  const isFetching = useIsFetching();

  return (
    <>
      {isFetching > 0 && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-primary/30 z-50">
          <div className="h-full bg-primary animate-pulse w-full" />
        </div>
      )}
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
        <ActiveUserProvider>
          <AppContent />
        </ActiveUserProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
