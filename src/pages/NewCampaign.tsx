
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Instagram, AlertCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { addMVPAutomation } from "@/lib/mvp";

const NewCampaign = () => {
  const [postUrl, setPostUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [dmTemplate, setDmTemplate] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isInMVPMode } = useAuth();

  // Check if user has connected Instagram account (skip in MVP mode)
  const { data: account } = useQuery({
    queryKey: ["connected-account"],
    queryFn: async () => {
      if (isInMVPMode) return null;
      
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: {
      postUrl: string;
      keywords: string[];
      dmTemplate: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("create-campaign", {
        body: campaignData,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Campanha criada!",
        description: "Sua campanha foi ativada e já está monitorando comentários.",
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate(`/posts/${data.mediaId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar campanha.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postUrl.trim()) {
      toast({
        title: "Erro",
        description: "Insira o link da postagem.",
        variant: "destructive",
      });
      return;
    }

    if (!keywords.trim()) {
      toast({
        title: "Erro",
        description: "Insira pelo menos uma palavra-chave.",
        variant: "destructive",
      });
      return;
    }

    if (!dmTemplate.trim()) {
      toast({
        title: "Erro",
        description: "Insira a mensagem de DM.",
        variant: "destructive",
      });
      return;
    }

    const keywordList = keywords
      .split(",")
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);

    if (keywordList.length === 0) {
      toast({
        title: "Erro",
        description: "Insira pelo menos uma palavra-chave válida.",
        variant: "destructive",
      });
      return;
    }

    // MVP Mode - save locally
    if (isInMVPMode) {
      addMVPAutomation({
        postUrl: postUrl.trim(),
        keywords: keywordList,
        dmTemplate: dmTemplate.trim(),
      });
      
      toast({
        title: "✅ Automação de teste criada!",
        description: "Sua automação foi salva localmente no modo MVP.",
      });
      navigate("/dashboard");
      return;
    }

    // Regular mode - call API
    createCampaignMutation.mutate({
      postUrl: postUrl.trim(),
      keywords: keywordList,
      dmTemplate: dmTemplate.trim(),
    });
  };

  const extractMediaIdExample = () => {
    return "Exemplo: https://www.instagram.com/p/ABC123DEF/";
  };

  if (!account && !isInMVPMode) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto text-orange-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Conecte seu Instagram primeiro
          </h2>
          <p className="text-gray-600 mb-6">
            Para criar campanhas, você precisa conectar sua conta do Instagram Business.
          </p>
          <Link to="/connect-instagram">
            <Button size="lg">
              <Instagram className="w-4 h-4 mr-2" />
              Conectar Instagram
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {isInMVPMode ? "Nova Automação de Teste" : "Nova Campanha"}
            </h1>
            {isInMVPMode && (
              <Badge variant="secondary">
                <Zap className="w-3 h-3 mr-1" />
                Modo MVP
              </Badge>
            )}
          </div>
          <p className="text-gray-600">
            {isInMVPMode 
              ? "Crie uma automação de teste (dados salvos localmente)" 
              : "Configure uma nova campanha de DM para uma postagem do Instagram"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Configuração da Campanha</span>
            </CardTitle>
            <CardDescription>
              {isInMVPMode 
                ? "Preencha os dados abaixo para simular uma automação (modo teste)"
                : "Preencha os dados abaixo para criar e ativar sua campanha"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="postUrl">Link da Postagem</Label>
                <Input
                  id="postUrl"
                  type="url"
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/ABC123DEF/"
                  required
                />
                <p className="text-sm text-gray-500">
                  {isInMVPMode 
                    ? "Cole qualquer link (simulação para teste)"
                    : "Cole o link completo da postagem do Instagram que você quer monitorar"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Palavras a Ouvir</Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="preço, valor, quanto custa, interessado"
                  required
                />
                <p className="text-sm text-gray-500">
                  {isInMVPMode 
                    ? "Separe as palavras-chave por vírgulas (simulação para teste)"
                    : "Separe as palavras-chave por vírgulas. Quando alguém comentar com essas palavras, receberá uma DM automática."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dmTemplate">Mensagem de DM</Label>
                <Textarea
                  id="dmTemplate"
                  value={dmTemplate}
                  onChange={(e) => setDmTemplate(e.target.value)}
                  placeholder="Oi {first_name}! Vi seu interesse no meu post. Que bom! Aqui está o link: {link}"
                  rows={4}
                  required
                />
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Mensagem que será enviada automaticamente. Você pode usar:</p>
                  <ul className="list-disc pl-5">
                    <li><code>{"{first_name}"}</code> - Nome da pessoa que comentou</li>
                    <li><code>{"{link}"}</code> - Link da postagem</li>
                  </ul>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={createCampaignMutation.isPending}
              >
                  {createCampaignMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isInMVPMode ? "Criar Automação de Teste" : "Criar e Ativar Campanha"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como funciona?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <p>Cole o link da sua postagem do Instagram</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <p>Defina as palavras-chave que quer monitorar nos comentários</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <p>Escreva a mensagem que será enviada automaticamente</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <p>Quando alguém usar as palavras-chave, receberá sua DM automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewCampaign;
