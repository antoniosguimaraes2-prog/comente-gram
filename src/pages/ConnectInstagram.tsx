import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { checkInstagramConfig, validateInstagramAccount, getConfigInstructions } from "@/lib/instagram-config";
import {
  Instagram,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Shield,
  Zap,
  ArrowRight,
  Info,
  Settings,
  AlertTriangle
} from "lucide-react";

const ConnectInstagram = () => {
  const [connecting, setConnecting] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isInMVPMode } = useAuth();

  // Check current connection status
  const { data: account, isLoading } = useQuery({
    queryKey: ["connected-account"],
    queryFn: async () => {
      if (isInMVPMode) return null;
      
      const { data, error } = await supabase
        .from("accounts")
        .select("id, page_id, ig_business_id, connected_at")
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !isInMVPMode,
  });

  // Check Instagram configuration status
  const { data: configStatus, isLoading: isCheckingConfig } = useQuery({
    queryKey: ["instagram-config-status"],
    queryFn: checkInstagramConfig,
    enabled: !isInMVPMode && !account, // Only check if not in MVP mode and no account connected
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Handle OAuth callback results
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'true') {
      toast({
        title: "✅ Conectado com sucesso!",
        description: "Sua conta do Instagram foi conectada. Agora você pode criar campanhas.",
      });
      // Clean URL
      window.history.replaceState({}, '', '/connect-instagram');
    }

    if (error) {
      toast({
        title: "Erro na conexão",
        description: decodeURIComponent(error),
        variant: "destructive",
      });
      // Clean URL
      window.history.replaceState({}, '', '/connect-instagram');
    }
  }, [searchParams, toast]);


  // Disconnect account mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!account) return;
      
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", account.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Desconectado",
        description: "Sua conta do Instagram foi desconectada.",
      });
      queryClient.invalidateQueries({ queryKey: ["connected-account"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao desconectar conta.",
        variant: "destructive",
      });
    },
  });

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Call edge function to start OAuth flow
      const { data, error } = await supabase.functions.invoke("instagram-oauth-start", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        // Check for specific configuration errors
        if (error.message?.includes('META_APP_ID not configured')) {
          throw new Error("Credenciais do Meta não configuradas. Configure META_APP_ID e META_APP_SECRET no Supabase.");
        }
        throw error;
      }

      if (data?.authUrl) {
        // Redirect to Instagram OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error("URL de autorização não recebida");
      }
    } catch (error: any) {
      console.error('Connection error:', error);

      let errorMessage = error.message || "Erro ao iniciar conexão com Instagram.";

      // Provide specific help based on error type
      if (error.message?.includes('META_APP_ID')) {
        errorMessage += "\n\n💡 Solução: Configure as credenciais do Meta no Supabase Dashboard.";
      }

      toast({
        title: "Erro de Conexão",
        description: errorMessage,
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Tem certeza que deseja desconectar sua conta do Instagram? Isso pausará todas as suas campanhas.')) {
      disconnectMutation.mutate();
    }
  };

  // MVP Mode
  if (isInMVPMode) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Conectar Instagram
            </h1>
            <p className="text-gray-600">
              No modo MVP, você pode testar sem conectar Instagram real
            </p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Modo de Teste</CardTitle>
              <CardDescription>
                Você está no modo MVP - todas as funcionalidades são simuladas
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No modo MVP, você pode criar e testar campanhas sem conectar uma conta real do Instagram. 
                  Os dados são salvos localmente no seu navegador.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Criar campanhas de teste</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Simular comentários e DMs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Testar todas as funcionalidades</span>
                </div>
              </div>

              <Button className="w-full" onClick={() => window.location.href = '/campaigns'}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Ir para Campanhas
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Conectar Instagram Business
          </h1>
          <p className="text-gray-600">
            Conecte sua conta do Instagram Business para automatizar DMs baseados em comentários
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection Status Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">
                {account ? "✅ Conta Conectada" : "Instagram Business"}
              </CardTitle>
              <CardDescription>
                {account 
                  ? `Conectado desde ${new Date(account.connected_at).toLocaleDateString("pt-BR")}`
                  : "Conecte sua conta do Instagram Business para começar"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {account ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      Conectado e Funcionando
                    </Badge>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Page ID:</span> 
                      <span className="ml-2 font-mono text-xs">{account.page_id}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Instagram Business ID:</span> 
                      <span className="ml-2 font-mono text-xs">{account.ig_business_id}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Conectado em:</span> 
                      <span className="ml-2">{new Date(account.connected_at).toLocaleString("pt-BR")}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Pode receber comentários</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Pode enviar DMs automáticas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Todas as permissões concedidas</span>
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    onClick={handleDisconnect}
                    disabled={disconnectMutation.isPending}
                    className="w-full"
                  >
                    {disconnectMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Desconectar Conta
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-orange-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Não conectado</span>
                  </div>
                  
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Pré-requisitos necessários:</strong>
                      <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                        <li>Conta Instagram Business (não pessoal)</li>
                        <li>Página do Facebook vinculada ao Instagram</li>
                        <li>Você deve ser administrador da Página</li>
                        <li>App Meta criado no developers.facebook.com</li>
                        <li>Credenciais META_APP_ID e META_APP_SECRET configuradas</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Primeira vez configurando?</strong><br/>
                      Consulte o arquivo <code>INSTAGRAM_SETUP.md</code> na raiz do projeto para
                      um guia completo passo-a-passo de configuração.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleConnect}
                    disabled={connecting || isCheckingConfig || !configStatus?.isConfigured}
                    size="lg"
                    className="w-full"
                  >
                    {connecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Instagram className="w-4 h-4 mr-2" />
                    {connecting ? 'Conectando...' :
                     isCheckingConfig ? 'Verificando...' :
                     !configStatus?.isConfigured ? 'Configure primeiro' :
                     'Conectar Instagram'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Ao conectar, você autoriza o acesso para gerenciar mensagens e comentários do Instagram
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {account ? "🎉 Próximos Passos" : "📋 Como Configurar"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {account ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Sua conta está conectada! Agora você pode:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Criar Campanhas</p>
                        <p className="text-xs text-gray-600">Configure DMs automáticas para suas postagens</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Definir Palavras-chave</p>
                        <p className="text-xs text-gray-600">Configure quais comentários ativam as DMs</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Monitorar Resultados</p>
                        <p className="text-xs text-gray-600">Acompanhe estatísticas no dashboard</p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => window.location.href = '/campaigns'}>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Ir para Campanhas
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Para usar o sistema de automação de DMs, você precisa:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-600">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Conta Instagram Business</p>
                        <p className="text-xs text-gray-600">Converta sua conta pessoal em Business ou crie uma nova</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-600">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Página do Facebook</p>
                        <p className="text-xs text-gray-600">Vincule sua conta Instagram a uma Página do Facebook</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-600">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Permissões de Admin</p>
                        <p className="text-xs text-gray-600">Você deve ser administrador da Página do Facebook</p>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Precisa de ajuda?</strong> Consulte a 
                      <a 
                        href="https://business.instagram.com/getting-started" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-1 text-blue-600 hover:text-blue-800 underline"
                      >
                        documentação oficial do Instagram Business
                        <ExternalLink className="inline w-3 h-3 ml-1" />
                      </a>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configuration Status */}
        {!isInMVPMode && !account && (
          <Card className={configStatus?.isConfigured ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Status da Configuração</span>
                {isCheckingConfig ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : configStatus?.isConfigured ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCheckingConfig ? (
                <p className="text-sm text-gray-600">Verificando configuração...</p>
              ) : configStatus?.isConfigured ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-800 font-medium">✅ Configuração completa!</p>
                  <p className="text-xs text-green-700">
                    Todas as credenciais estão configuradas corretamente. Você pode conectar sua conta Instagram agora.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-orange-800 font-medium">⚠️ Configuração necessária</p>

                  {configStatus?.errors && configStatus.errors.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-orange-700 font-medium">Problemas encontrados:</p>
                      <ul className="text-xs text-orange-700 list-disc pl-4 space-y-0.5">
                        {configStatus.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-xs text-orange-700 font-medium">Passos necessários:</p>
                    <ol className="text-xs text-orange-700 list-decimal pl-4 space-y-0.5">
                      {getConfigInstructions().map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-xs">
                      <strong>Precisa de ajuda?</strong> Consulte o arquivo <code>INSTAGRAM_SETUP.md</code>
                      para instruções detalhadas passo-a-passo.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Debug Information (only in development) */}
        {process.env.NODE_ENV === 'development' && account && (
          <Card className="border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-gray-800 text-sm">🔧 Informações da Conta (Debug)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-2 text-gray-700">
                <p><strong>Validação da conta:</strong></p>
                {(() => {
                  const validation = validateInstagramAccount(account);
                  return validation.isValid ? (
                    <p className="text-green-600">�� Conta válida e funcionando</p>
                  ) : (
                    <ul className="list-disc pl-4 space-y-1 text-orange-600">
                      {validation.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ConnectInstagram;
