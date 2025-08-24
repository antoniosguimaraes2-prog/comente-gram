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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Plus,
  Instagram,
  AlertCircle,
  Zap,
  ChevronLeft,
  ChevronRight,
  Check,
  Image,
  Video,
  X,
  MessageSquare,
  Link as LinkIcon,
  MousePointer,
  Hash
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { addMVPAutomation } from "@/lib/mvp";

interface CampaignData {
  name: string;
  selectedPosts: InstagramPost[];
  keywords: string[];
  listenAllComments: boolean;
  messageType: 'simple' | 'link' | 'button';
  messageContent: string;
}

interface InstagramPost {
  id: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  timestamp: string;
}

const STEPS = [
  { id: 1, name: 'Nome da Campanha', description: 'Identifique sua automação' },
  { id: 2, name: 'Escolher Publicações', description: 'Selecione posts do Instagram' },
  { id: 3, name: 'Palavras-chave', description: 'Configure palavras para monitorar' },
  { id: 4, name: 'Mensagem DM', description: 'Configure a resposta automática' },
  { id: 5, name: 'Revisar e Salvar', description: 'Confirme e ative a campanha' }
];

const NewCampaign = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    selectedPosts: [],
    keywords: [],
    listenAllComments: false,
    messageType: 'simple',
    messageContent: ''
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [showPostGallery, setShowPostGallery] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isInMVPMode } = useAuth();

  // Get user's Instagram posts
  const { data: instagramPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["instagram-posts"],
    queryFn: async () => {
      if (isInMVPMode) {
        // Mock data for MVP mode
        return [
          {
            id: "mock_1",
            media_url: "https://picsum.photos/400/400?random=1",
            thumbnail_url: "https://picsum.photos/200/200?random=1",
            caption: "Post de exemplo 1 #marketing #vendas",
            media_type: "IMAGE" as const,
            timestamp: new Date().toISOString()
          },
          {
            id: "mock_2", 
            media_url: "https://picsum.photos/400/600?random=2",
            thumbnail_url: "https://picsum.photos/200/300?random=2",
            caption: "Post de exemplo 2 com vídeo #promocao",
            media_type: "VIDEO" as const,
            timestamp: new Date(Date.now() - 86400000).toISOString()
          }
        ];
      }

      const { data, error } = await supabase.functions.invoke("get-instagram-posts");
      if (error) throw error;
      return data.posts || [];
    },
    enabled: currentStep === 2,
  });

  // Get available accounts (skip in MVP mode)
  const { data: accounts = [] } = useQuery({
    queryKey: ["user-accounts"],
    queryFn: async () => {
      if (isInMVPMode) return [];
      
      const { data, error } = await supabase
        .from("accounts")
        .select("id, page_id, ig_business_id");
      
      if (error) throw error;
      return data.map(acc => ({
        id: acc.id,
        name: `Conta ${acc.page_id}`,
        pageId: acc.page_id,
      }));
    },
    enabled: !isInMVPMode,
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (finalData: CampaignData) => {
      if (isInMVPMode) {
        addMVPAutomation({
          name: finalData.name,
          accountName: "Conta de Teste MVP",
          postUrl: `https://instagram.com/p/${finalData.selectedPosts[0]?.id}`,
          keywords: finalData.keywords,
          dmTemplate: finalData.messageContent,
        });
        return { success: true };
      }

      // Create campaigns for each selected post
      const promises = finalData.selectedPosts.map(post =>
        supabase.functions.invoke("create-campaign", {
          body: {
            name: `${finalData.name} - ${post.id}`,
            postUrl: `https://instagram.com/p/${post.id}`,
            keywords: finalData.keywords,
            dmTemplate: finalData.messageContent,
            listenAllComments: finalData.listenAllComments,
            messageType: finalData.messageType
          },
        })
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw new Error(`Erro ao criar ${errors.length} campanhas`);
      }

      return { success: true, campaignsCreated: results.length };
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Campanha criada com sucesso!",
        description: isInMVPMode 
          ? "Sua campanha foi salva no modo teste."
          : `${data.campaignsCreated} automações foram ativadas.`,
      });
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar campanha.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!campaignData.name.trim()) {
          toast({
            title: "Erro",
            description: "Digite o nome da campanha.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 2:
        if (campaignData.selectedPosts.length === 0) {
          toast({
            title: "Erro", 
            description: "Selecione pelo menos uma publicação.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 3:
        if (!campaignData.listenAllComments && campaignData.keywords.length === 0) {
          toast({
            title: "Erro",
            description: "Adicione pelo menos uma palavra-chave ou ative 'Ouvir todos os comentários'.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 4:
        if (!campaignData.messageContent.trim()) {
          toast({
            title: "Erro",
            description: "Digite a mensagem de DM.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      createCampaignMutation.mutate(campaignData);
    }
  };

  const addKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase();
    if (keyword && !campaignData.keywords.includes(keyword)) {
      setCampaignData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setCampaignData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const togglePostSelection = (post: InstagramPost) => {
    setCampaignData(prev => ({
      ...prev,
      selectedPosts: prev.selectedPosts.some(p => p.id === post.id)
        ? prev.selectedPosts.filter(p => p.id !== post.id)
        : [...prev.selectedPosts, post]
    }));
  };

  const insertVariable = (variable: string) => {
    setCampaignData(prev => ({
      ...prev,
      messageContent: prev.messageContent + `{${variable}}`
    }));
  };

  if (!isInMVPMode && accounts.length === 0) {
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {isInMVPMode ? "Nova Campanha de Teste" : "Nova Campanha"}
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
              ? "Crie uma campanha de teste (dados salvos localmente)" 
              : "Configure uma nova campanha de DM automatizada"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                currentStep === step.id 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : currentStep > step.id
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}>
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-3 hidden md:block">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`ml-6 w-12 h-px ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>{STEPS[currentStep - 1].name}</span>
            </CardTitle>
            <CardDescription>
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Campaign Name */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Nome da Campanha</Label>
                  <Input
                    id="campaignName"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    placeholder="Ex: Promoção Black Friday, Vendas de Curso..."
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-500">
                    Dê um nome descritivo para identificar esta campanha facilmente.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Instagram Posts Selection */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Selecionar Publicações</h3>
                    <p className="text-sm text-gray-500">
                      Escolha as publicações que serão monitoradas para comentários
                    </p>
                  </div>
                  <Button onClick={() => setShowPostGallery(true)}>
                    <Instagram className="w-4 h-4 mr-2" />
                    Ver Galeria
                  </Button>
                </div>

                {campaignData.selectedPosts.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {campaignData.selectedPosts.map(post => (
                      <div key={post.id} className="relative">
                        <img
                          src={post.thumbnail_url || post.media_url}
                          alt="Post selecionado"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute top-2 right-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => togglePostSelection(post)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          {post.media_type === 'VIDEO' ? (
                            <Video className="w-4 h-4 text-white" />
                          ) : (
                            <Image className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {campaignData.selectedPosts.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Instagram className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Nenhuma publicação selecionada</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setShowPostGallery(true)}
                    >
                      Selecionar Publicações
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Keywords Configuration */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Configurar Monitoramento</h3>
                      <p className="text-sm text-gray-500">
                        Defina como monitorar os comentários
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="listen-all">Ouvir todos os comentários</Label>
                      <Switch
                        id="listen-all"
                        checked={campaignData.listenAllComments}
                        onCheckedChange={(checked) => setCampaignData(prev => ({
                          ...prev,
                          listenAllComments: checked
                        }))}
                      />
                    </div>
                  </div>

                  {!campaignData.listenAllComments && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Palavras-chave</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            placeholder="Digite uma palavra-chave"
                            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                          />
                          <Button onClick={addKeyword} disabled={!keywordInput.trim()}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                          Quando alguém comentar com essas palavras, receberá uma DM automática.
                        </p>
                      </div>

                      {campaignData.keywords.length > 0 && (
                        <div className="space-y-2">
                          <Label>Palavras-chave adicionadas:</Label>
                          <div className="flex flex-wrap gap-2">
                            {campaignData.keywords.map(keyword => (
                              <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                {keyword}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-auto p-0 ml-1"
                                  onClick={() => removeKeyword(keyword)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: DM Message Configuration */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configurar Mensagem de DM</h3>
                  
                  {/* Message Type Selection */}
                  <div className="space-y-3">
                    <Label>Tipo de Mensagem</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant={campaignData.messageType === 'simple' ? 'default' : 'outline'}
                        onClick={() => setCampaignData(prev => ({ ...prev, messageType: 'simple' }))}
                        className="flex flex-col items-center p-4 h-auto"
                      >
                        <MessageSquare className="w-6 h-6 mb-2" />
                        <span>Mensagem Simples</span>
                      </Button>
                      <Button
                        variant={campaignData.messageType === 'link' ? 'default' : 'outline'}
                        onClick={() => setCampaignData(prev => ({ ...prev, messageType: 'link' }))}
                        className="flex flex-col items-center p-4 h-auto"
                      >
                        <LinkIcon className="w-6 h-6 mb-2" />
                        <span>Com Link</span>
                      </Button>
                      <Button
                        variant={campaignData.messageType === 'button' ? 'default' : 'outline'}
                        onClick={() => setCampaignData(prev => ({ ...prev, messageType: 'button' }))}
                        className="flex flex-col items-center p-4 h-auto"
                      >
                        <MousePointer className="w-6 h-6 mb-2" />
                        <span>Com Botão</span>
                      </Button>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="space-y-2">
                    <Label htmlFor="messageContent">Conteúdo da Mensagem</Label>
                    <Textarea
                      id="messageContent"
                      value={campaignData.messageContent}
                      onChange={(e) => setCampaignData(prev => ({
                        ...prev,
                        messageContent: e.target.value
                      }))}
                      placeholder="Oi {first_name}! Vi seu interesse no meu post..."
                      rows={4}
                    />
                  </div>

                  {/* Variable Buttons */}
                  <div className="space-y-2">
                    <Label>Variáveis Disponíveis</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => insertVariable('first_name')}
                      >
                        Nome do usuário
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => insertVariable('username')}
                      >
                        @username
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => insertVariable('post_url')}
                      >
                        Link do post
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Clique nos botões acima para inserir variáveis na mensagem.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review and Save */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Revisar Campanha</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nome da Campanha</Label>
                    <p className="text-lg">{campaignData.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Publicações Selecionadas</Label>
                    <p className="text-sm">{campaignData.selectedPosts.length} publicação(ões)</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Monitoramento</Label>
                    <p className="text-sm">
                      {campaignData.listenAllComments 
                        ? "Todos os comentários" 
                        : `${campaignData.keywords.length} palavra(s)-chave: ${campaignData.keywords.join(', ')}`
                      }
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tipo de Mensagem</Label>
                    <p className="text-sm capitalize">{campaignData.messageType}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Mensagem de DM</Label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{campaignData.messageContent}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              {currentStep < STEPS.length ? (
                <Button onClick={handleNext}>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createCampaignMutation.isPending}
                >
                  {createCampaignMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isInMVPMode ? "Criar Campanha de Teste" : "Criar e Ativar Campanha"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instagram Posts Gallery Dialog */}
        <Dialog open={showPostGallery} onOpenChange={setShowPostGallery}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Escolher Publicações do Instagram</DialogTitle>
            </DialogHeader>
            
            <div className="max-h-96 overflow-y-auto">
              {postsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {instagramPosts.map(post => (
                    <div
                      key={post.id}
                      className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-colors ${
                        campaignData.selectedPosts.some(p => p.id === post.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => togglePostSelection(post)}
                    >
                      <img
                        src={post.thumbnail_url || post.media_url}
                        alt="Instagram post"
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        {post.media_type === 'VIDEO' ? (
                          <Video className="w-4 h-4 text-white" />
                        ) : (
                          <Image className="w-4 h-4 text-white" />
                        )}
                      </div>
                      {campaignData.selectedPosts.some(p => p.id === post.id) && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {post.caption || "Sem legenda"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <p className="text-sm text-gray-500">
                {campaignData.selectedPosts.length} publicação(ões) selecionada(s)
              </p>
              <Button onClick={() => setShowPostGallery(false)}>
                Confirmar Seleção
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default NewCampaign;
