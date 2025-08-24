import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, Instagram } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { enableMVPMode } from "@/lib/mvp";
import GoogleIcon from "@/components/GoogleIcon";
import Footer from "@/components/Footer";

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (email: string, password: string, isSignUp: boolean) => {
    setLoading(true);
    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/campaigns`
            }
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (isSignUp) {
        toast({
          title: "Conta criada!",
          description: "Verifique seu email para confirmar a conta.",
        });
      } else {
        toast({
          title: "Login realizado!",
          description: "Redirecionando para o dashboard...",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro durante a autenticação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/campaigns`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;

    } catch (error: any) {
      console.error('Google login error:', error);
      
      toast({
        title: "Erro no Login com Google",
        description: error.message || "Erro no login com Google.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleMVPMode = () => {
    enableMVPMode();
    toast({
      title: "Modo MVP ativado!",
      description: "Você pode criar e testar automações sem conectar Instagram.",
    });
    navigate("/campaigns");
  };

  const AuthForm = ({ isSignUp }: { isSignUp: boolean }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos.",
          variant: "destructive",
        });
        return;
      }
      handleAuth(email, password, isSignUp);
    };

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSignUp ? "Criar Conta" : "Entrar"}
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Instagram className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">ComenteDM</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/home" className="text-gray-600 hover:text-gray-900">
                Início
              </Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                Preços
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Entrar na sua conta</CardTitle>
            <CardDescription>
              Acesse o ComenteDM e automatize suas vendas no Instagram
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              <Button 
                onClick={handleMVPMode} 
                className="w-full" 
                variant="default"
                disabled={loading}
              >
                <Zap className="w-4 h-4 mr-2" />
                Entrar sem login (Modo MVP)
              </Button>
              
              <Button
                onClick={handleGoogleLogin}
                className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                variant="outline"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <GoogleIcon className="w-4 h-4 mr-2" />
                )}
                Continuar com Google
              </Button>
            </div>
            
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continue com email
                </span>
              </div>
            </div>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-6">
                <AuthForm isSignUp={false} />
              </TabsContent>
              <TabsContent value="signup" className="mt-6">
                <AuthForm isSignUp={true} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AuthPage;
