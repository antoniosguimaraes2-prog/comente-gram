import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import ConnectInstagram from "./pages/ConnectInstagram";
import NewCampaign from "./pages/NewCampaign";
import PostDetails from "./pages/PostDetails";
import CampaignDetails from "./pages/CampaignDetails";
import Home from "./pages/Home";
import Account from "./pages/Account";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Billing from "./pages/Billing";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Campaigns />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <Campaigns />
              </ProtectedRoute>
            } />
            <Route path="/connect-instagram" element={
              <ProtectedRoute>
                <ConnectInstagram />
              </ProtectedRoute>
            } />
            <Route path="/new" element={
              <ProtectedRoute>
                <NewCampaign />
              </ProtectedRoute>
            } />
            <Route path="/posts/:mediaId" element={
              <ProtectedRoute>
                <PostDetails />
              </ProtectedRoute>
            } />
            <Route path="/automations/:campaignId" element={
              <ProtectedRoute>
                <CampaignDetails />
              </ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
