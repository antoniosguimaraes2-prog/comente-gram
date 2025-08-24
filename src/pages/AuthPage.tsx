import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, AlertCircle, Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { enableMVPMode } from "@/lib/mvp";
import GoogleIcon from "@/components/GoogleIcon";
import { useAuthConfig } from "@/hooks/use-auth-config";
import { getGoogleConsoleInstructions } from "@/lib/auth-config";

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [showOAuthInfo, setShowOAuthInfo] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isGoogleConfigured, loading: configLoading, supabaseConfig, refreshConfig } = useAuthConfig();

  const handleAuth = async (email: string, password: string, isSignUp: boolean) => {
    setLoading(true);
    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/dashboard`
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/campaigns`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        // Check for specific Google OAuth configuration errors
        if (error.message.includes('OAuth') || error.message.includes('provider')) {
          throw new Error('Google OAuth não está configurado. Verifique as configurações no Supabase.');
        }
        throw error;
      }

      // Note: For OAuth providers, the user is redirected and loading state
      // will be managed by the redirect flow

    } catch (error: any) {
      console.error('Google login error:', error);

      let errorMessage = "Erro no login com Google.";

      if (error.message.includes('OAuth')) {
        errorMessage = "Google OAuth não está configurado. Configure no painel do Supabase.";
      } else if (error.message.includes('redirect')) {
        errorMessage = "Erro de redirecionamento. Verifique as URLs configuradas.";
      } else if (error.message.includes('popup')) {
        errorMessage = "Popup bloqueado. Permita popups para este site.";
      }

      toast({
        title: "Erro no Login com Google",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "teste@teste.com",
        password: "teste123",
      });

      if (error) {
        // Se falhar o login, tenta criar a conta
        const { error: signUpError } = await supabase.auth.signUp({
          email: "teste@teste.com",
          password: "teste123",
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });

        if (signUpError) {
          // Se falhou, entrar em modo MVP
          toast({
            title: "Entrando em Modo MVP",
            description: "Acesso liberado para testes sem configuração do Supabase.",
          });
          handleMVPMode();
        } else {
          toast({
            title: "Conta de teste criada!",
            description: "Fazendo login automático...",
          });
          // Tenta fazer login novamente
          await supabase.auth.signInWithPassword({
            email: "teste@teste.com",
            password: "teste123",
          });
        }
      } else {
        toast({
          title: "Login de teste realizado!",
          description: "Redirecionando...",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `${error.message}. Configure o Supabase corretamente.`,
        variant: "destructive",
      });
    } finally {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ComenteDM</CardTitle>
          <CardDescription>
            Automação de DMs no Instagram
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
              onClick={handleTestLogin} 
              className="w-full" 
              variant="outline"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Login de Teste (teste@teste.com)
            </Button>
            
            <Button
              onClick={handleGoogleLogin}
              className={`w-full border ${
                isGoogleConfigured
                  ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              variant="outline"
              disabled={loading || configLoading || !isGoogleConfigured}
              title={!isGoogleConfigured ? 'Google OAuth não está configurado' : ''}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <GoogleIcon className="w-4 h-4 mr-2" />
              )}
              {isGoogleConfigured ? 'Continuar com Google' : 'Google (Não configurado)'}
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

      {/* OAuth Configuration Info */}
      <div className="mt-6 max-w-md">
        <Alert variant={isGoogleConfigured ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Status Google OAuth:</strong>{" "}
            {configLoading ? (
              "Verificando configuração..."
            ) : isGoogleConfigured ? (
              <span className="text-green-600">✅ Configurado</span>
            ) : (
              <>
                <span className="text-red-600">❌ Não configurado</span>
                {" - "}
                <button
                  onClick={() => setShowOAuthInfo(!showOAuthInfo)}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Ver instruções
                </button>
              </>
            )}
          </AlertDescription>
        </Alert>

        {showOAuthInfo && !isGoogleConfigured && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm space-y-3">
            <p><strong>Configuração rápida:</strong></p>

            {supabaseConfig && (
              <div className="space-y-2">
                <p><strong>1.</strong> Configure no Google Console:</p>
                <div className="ml-4 bg-white p-2 rounded border">
                  <p className="font-mono text-xs break-all">
                    Redirect URI: {supabaseConfig.callbackUrl}
                  </p>
                </div>

                <p><strong>2.</strong> Configure no Supabase:</p>
                <a
                  href={supabaseConfig.dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                >
                  🚀 Abrir Supabase Dashboard
                </a>
              </div>
            )}

            <div className="border-t pt-3 space-y-2">
              <Button
                onClick={async () => {
                  await refreshConfig();
                  // Show success toast if Google is now configured
                  if (isGoogleConfigured) {
                    toast({
                      title: "✅ Google OAuth Configurado!",
                      description: "O login com Google está funcionando corretamente.",
                    });
                  }
                }}
                disabled={configLoading}
                size="sm"
                variant="outline"
                className="w-full"
              >
                {configLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "🔄"
                )}
                Verificar configuração novamente
              </Button>

              <p className="text-blue-600 text-center">
                <a
                  href="https://supabase.com/docs/guides/auth/social-login/auth-google"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  📖 Documentação completa
                </a>
                {" | "}
                <a
                  href="/GOOGLE_AUTH_SETUP.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  📄 Guia detalhado
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
