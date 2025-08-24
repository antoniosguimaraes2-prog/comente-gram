import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Instagram, BarChart3, Plus, Zap, Target } from "lucide-react";
import { disableMVPMode } from "@/lib/mvp";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, isInMVPMode } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    if (isInMVPMode) {
      disableMVPMode();
      window.location.href = "/auth";
    } else {
      await supabase.auth.signOut();
    }
  };

  const navItems = [
    { path: "/campaigns", label: "Campanhas", icon: Target },
    { path: "/new", label: "Nova Campanha", icon: Plus },
    { path: "/connect-instagram", label: "Conectar Instagram", icon: Instagram },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <Link to="/campaigns" className="text-xl font-bold text-blue-600">
                  ComenteDM
                </Link>
                {isInMVPMode && (
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Modo MVP
                  </Badge>
                )}
              </div>
              <nav className="hidden md:flex space-x-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === item.path
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {isInMVPMode ? "Modo MVP" : user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
