
import React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import AuthPage from "@/components/AuthPage";
import { useAuth } from "@/hooks/useAuth";
import { PosLayout } from "@/components/PosLayout";
import { Dashboard } from "@/components/Dashboard";
import { db } from "@/lib/database";
import SalesModule from "./pages/SalesModule";
import ProductsModule from "./pages/ProductsModule";
import Users from "./pages/Users";
import Backup from "./pages/Backup";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Initialize database when app starts
  React.useEffect(() => {
    db.initializeDatabase();
  }, []);

  // Debug logging
  React.useEffect(() => {
    console.log('App: Auth state changed:', { isAuthenticated, loading, user });
  }, [isAuthenticated, loading, user]);
  
  if (loading) {
    console.log('App: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('App: Not authenticated, showing auth page');
    return <AuthPage />;
  }
  
  console.log('App: Authenticated, showing POS layout');
  
  return (
    <PosLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sales" element={<SalesModule />} />
        <Route path="/products" element={<ProductsModule />} />
        <Route path="/users" element={<Users />} />
        <Route path="/backup" element={<Backup />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PosLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
