import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import { RedirectAuthToLogin } from "@/components/RedirectAuthToLogin";
import { ToastBridge } from "@/components/ToastBridge";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import ParentDashboard from "./pages/ParentDashboard";
import NotFound from "./pages/NotFound";
import KidDashboard from "./pages/kid/KidDashboard";
import KidCalendar from "./pages/kid/KidCalendar";
import KidRewards from "./pages/kid/KidRewards";
import KidHistory from "./pages/kid/KidHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <ToastBridge />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<RedirectAuthToLogin />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/parent" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
            
            {/* Kid Experience Routes - Protected */}
            <Route path="/kid/:kidId" element={<ProtectedRoute><KidDashboard /></ProtectedRoute>} />
            <Route path="/kid/:kidId/calendar" element={<ProtectedRoute><KidCalendar /></ProtectedRoute>} />
            <Route path="/kid/:kidId/rewards" element={<ProtectedRoute><KidRewards /></ProtectedRoute>} />
            <Route path="/kid/:kidId/history" element={<ProtectedRoute><KidHistory /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
