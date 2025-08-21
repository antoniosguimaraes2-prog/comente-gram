
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Instagram, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const ConnectInstagram = () => {
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check current connection status
  const { data: account, isLoading } = useQuery({
    queryKey: ["connected-account"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  // Disconnect account mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", account?.id);
      
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
      const { data, error } = await supabase.functions.invoke("instagram-oauth-start");
      
      if (error) throw error;
      
      if (data?.authUrl) {
        // Redirect to Instagram OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error("URL de autorização não recebida");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao iniciar conexão com Instagram.",
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Conectar Instagram
          </h1>
          <p className="text-gray-600">
            Conecte sua conta do Instagram Business para automatizar DMs
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Instagram className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">
              {account ? "Conta Conectada" : "Instagram Business"}
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
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Conectado
                  </Badge>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Page ID:</span> {account.page_id}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Instagram Business ID:</span> {account.ig_business_id}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Conectado em:</span> {new Date(account.connected_at).toLocaleString("pt-BR")}
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
                
                <div className="text-sm text-gray-600 space-y-2">
                  <p>Para conectar sua conta do Instagram:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Você precisa ter uma conta Instagram Business</li>
                    <li>A conta deve estar vinculada a uma Página do Facebook</li>
                    <li>Você deve ser administrador da Página</li>
                  </ul>
                </div>

                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  size="lg"
                  className="w-full"
                >
                  {connecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Instagram className="w-4 h-4 mr-2" />
                  Conectar Instagram (Meta OAuth)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {account && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Agora que sua conta está conectada, você pode:
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Criar campanhas de DM para suas postagens</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Definir palavras-chave para monitorar comentários</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Acompanhar estatísticas no dashboard</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ConnectInstagram;
