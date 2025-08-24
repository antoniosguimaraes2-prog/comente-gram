import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { isMVPMode } from "@/lib/mvp";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isInMVPMode: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isInMVPMode: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInMVPMode, setIsInMVPMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check MVP mode first
    const mvpMode = isMVPMode();
    setIsInMVPMode(mvpMode);
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Redirect logic - MVP mode bypasses auth requirements
      if (mvpMode && location.pathname === "/auth") {
        navigate("/campaigns");
      } else if (session?.user && location.pathname === "/auth") {
        navigate("/campaigns");
      } else if (!session?.user && !mvpMode && location.pathname !== "/auth") {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (event === "SIGNED_IN" && session?.user) {
          navigate("/campaigns");
        } else if (event === "SIGNED_OUT") {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <AuthContext.Provider value={{ user, loading, isInMVPMode }}>
      {children}
    </AuthContext.Provider>
  );
};
