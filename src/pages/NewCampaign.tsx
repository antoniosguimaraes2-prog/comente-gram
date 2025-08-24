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

interface Button {
  name: string;
  url: string;
  responseMessage: string;
}

interface CampaignData {
  name: string;
  selectedPosts: InstagramPost[];
  keywords: string[];
  listenAllComments: boolean;
  messageType: 'simple' | 'link' | 'button';
  messageContent: string;
  linkUrl: string;
  buttons: Button[];
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

// Instagram DM Mockup Component
const InstagramDMMockup = ({ campaignData }: { campaignData: CampaignData }) => {
  const formatMessage = (content: string) => {
    return content
      .replace(/{first_name}/g, 'João')
      .replace(/{username}/g, '@joaosilva')
      .replace(/{post_url}/g, 'instagram.com/p/ABC123');
  };

  return (
    <div className="flex justify-center">
      {/* Phone Frame */}
      <div className="relative w-80 h-[600px] bg-black rounded-[3rem] p-2 shadow-2xl">
        {/* Screen */}
        <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
          {/* Status Bar */}
          <div className="bg-white h-12 flex items-center justify-between px-6 text-black text-sm font-medium">
            <span>9:41</span>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-2 border border-black rounded-sm">
                <div className="w-3 h-1 bg-black rounded-sm m-[1px]"></div>
              </div>
            </div>
          </div>

          {/* DM Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <div>
              <p className="font-semibold text-sm">Minha Empresa</p>
              <p className="text-xs text-gray-500">Ativo agora</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 bg-gray-50 min-h-[400px]">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-lg max-w-xs">
                <p className="text-sm">interessado</p>
              </div>
            </div>

            {/* Bot response */}
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-lg max-w-xs shadow-sm">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {formatMessage(campaignData.messageContent)}
                </p>

                {/* Link preview for link type */}
                {campaignData.messageType === 'link' && campaignData.linkUrl && (
                  <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="h-20 bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                      <LinkIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-600 truncate">{campaignData.linkUrl}</p>
                    </div>
                  </div>
                )}

                {/* Buttons for button type */}
                {campaignData.messageType === 'button' && campaignData.buttons.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {campaignData.buttons.map((button, index) => (
                      <button
                        key={index}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        {button.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Delivered indicator */}
            <div className="flex justify-start">
              <p className="text-xs text-gray-400 ml-2">Entregue</p>
            </div>
          </div>

          {/* Message Input (inactive) */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center space-x-2">
              <span className="text-gray-400 text-sm flex-1">Mensagem...</span>
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-50"></div>
      </div>
    </div>
  );
};

const NewCampaign = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    selectedPosts: [],
    keywords: [],
    listenAllComments: false,
    messageType: 'simple',
    messageContent: '',
    linkUrl: '',
    buttons: []
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
          messageType: finalData.messageType,
          linkUrl: finalData.linkUrl,
          buttons: finalData.buttons,
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
            messageType: finalData.messageType,
            linkUrl: finalData.linkUrl,
            buttons: finalData.buttons
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

        if (campaignData.messageType === 'link' && !campaignData.linkUrl.trim()) {
          toast({
            title: "Erro",
            description: "Digite o link para a mensagem.",
            variant: "destructive",
          });
          return false;
        }

        if (campaignData.messageType === 'button') {
          if (campaignData.buttons.length === 0) {
            toast({
              title: "Erro",
              description: "Adicione pelo menos um botão.",
              variant: "destructive",
            });
            return false;
          }

          for (let i = 0; i < campaignData.buttons.length; i++) {
            const button = campaignData.buttons[i];
            if (!button.name.trim() || !button.url.trim() || !button.responseMessage.trim()) {
              toast({
                title: "Erro",
                description: `Preencha todos os campos do botão ${i + 1}.`,
                variant: "destructive",
              });
              return false;
            }
          }
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

  const addButton = () => {
    if (campaignData.buttons.length < 2) {
      setCampaignData(prev => ({
        ...prev,
        buttons: [...prev.buttons, { name: '', url: '', responseMessage: '' }]
      }));
    }
  };

  const updateButton = (index: number, field: keyof Button, value: string) => {
    setCampaignData(prev => ({
      ...prev,
      buttons: prev.buttons.map((button, i) =>
        i === index ? { ...button, [field]: value } : button
      )
    }));
  };

  const removeButton = (index: number) => {
    setCampaignData(prev => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index)
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
                        onClick={() => setCampaignData(prev => ({
                          ...prev,
                          messageType: 'simple',
                          linkUrl: '',
                          buttons: []
                        }))}
                        className="flex flex-col items-center p-4 h-auto"
                      >
                        <MessageSquare className="w-6 h-6 mb-2" />
                        <span>Mensagem Simples</span>
                      </Button>
                      <Button
                        variant={campaignData.messageType === 'link' ? 'default' : 'outline'}
                        onClick={() => setCampaignData(prev => ({
                          ...prev,
                          messageType: 'link',
                          buttons: []
                        }))}
                        className="flex flex-col items-center p-4 h-auto"
                      >
                        <LinkIcon className="w-6 h-6 mb-2" />
                        <span>Com Link</span>
                      </Button>
                      <Button
                        variant={campaignData.messageType === 'button' ? 'default' : 'outline'}
                        onClick={() => setCampaignData(prev => ({
                          ...prev,
                          messageType: 'button',
                          linkUrl: ''
                        }))}
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

                  {/* Link Configuration - Only for 'link' type */}
                  {campaignData.messageType === 'link' && (
                    <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Label htmlFor="linkUrl" className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Link da Mensagem
                      </Label>
                      <Input
                        id="linkUrl"
                        type="url"
                        value={campaignData.linkUrl}
                        onChange={(e) => setCampaignData(prev => ({
                          ...prev,
                          linkUrl: e.target.value
                        }))}
                        placeholder="https://meusite.com/oferta"
                      />
                      <p className="text-sm text-blue-600">
                        Este link será incluído automaticamente na mensagem e será encurtado para analytics.
                      </p>
                    </div>
                  )}

                  {/* Button Configuration - Only for 'button' type */}
                  {campaignData.messageType === 'button' && (
                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <MousePointer className="w-4 h-4" />
                          Configuração dos Botões (máx. 2)
                        </Label>
                        <Button
                          size="sm"
                          onClick={addButton}
                          disabled={campaignData.buttons.length >= 2}
                          variant="outline"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar Botão
                        </Button>
                      </div>

                      {campaignData.buttons.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          <MousePointer className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">Nenhum botão configurado</p>
                          <Button
                            size="sm"
                            onClick={addButton}
                            variant="outline"
                            className="mt-2"
                          >
                            Adicionar Primeiro Botão
                          </Button>
                        </div>
                      )}

                      {campaignData.buttons.map((button, index) => (
                        <div key={index} className="space-y-3 p-3 bg-white rounded border">
                          <div className="flex items-center justify-between">
                            <Label className="font-medium">Botão {index + 1}</Label>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeButton(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Nome do Botão</Label>
                              <Input
                                value={button.name}
                                onChange={(e) => updateButton(index, 'name', e.target.value)}
                                placeholder="Ex: Ver Oferta"
                                maxLength={20}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Link do Botão</Label>
                              <Input
                                type="url"
                                value={button.url}
                                onChange={(e) => updateButton(index, 'url', e.target.value)}
                                placeholder="https://exemplo.com"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm">Mensagem quando clicado</Label>
                            <Textarea
                              value={button.responseMessage}
                              onChange={(e) => updateButton(index, 'responseMessage', e.target.value)}
                              placeholder="Obrigado pelo interesse! Aqui está mais informações..."
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}

                      <p className="text-sm text-green-600">
                        Quando o usuário clicar no botão, receberá a mensagem configurada acima.
                      </p>
                    </div>
                  )}

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
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Prévia da Mensagem</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Veja como sua mensagem aparecerá no Instagram
                  </p>
                </div>

                {/* Instagram DM Mockup */}
                <InstagramDMMockup campaignData={campaignData} />

                {/* Campaign Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {campaignData.selectedPosts.length}
                    </div>
                    <div className="text-sm text-blue-800 font-medium">Publicações</div>
                    <div className="text-xs text-blue-600 mt-1">Monitoradas</div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {campaignData.listenAllComments ? '∞' : campaignData.keywords.length}
                    </div>
                    <div className="text-sm text-green-800 font-medium">Palavras-chave</div>
                    <div className="text-xs text-green-600 mt-1">
                      {campaignData.listenAllComments ? 'Todos os comentários' : 'Específicas'}
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {campaignData.messageType === 'simple' ? '📝' :
                       campaignData.messageType === 'link' ? '🔗' : '🔘'}
                    </div>
                    <div className="text-sm text-purple-800 font-medium">Tipo</div>
                    <div className="text-xs text-purple-600 mt-1">
                      {campaignData.messageType === 'simple' && 'Simples'}
                      {campaignData.messageType === 'link' && 'Com Link'}
                      {campaignData.messageType === 'button' && 'Com Botão'}
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {campaignData.messageType === 'button' ? campaignData.buttons.length :
                       campaignData.messageType === 'link' ? '1' : '0'}
                    </div>
                    <div className="text-sm text-orange-800 font-medium">Interações</div>
                    <div className="text-xs text-orange-600 mt-1">
                      {campaignData.messageType === 'button' ? 'Botões' :
                       campaignData.messageType === 'link' ? 'Link' : 'Nenhuma'}
                    </div>
                  </div>
                </div>

                {/* Detailed Information Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900">Detalhes da Campanha</h4>
                  </div>

                  <div className="divide-y divide-gray-200">
                    <div className="px-6 py-4 flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Nome da Campanha</span>
                      <span className="text-sm text-gray-900">{campaignData.name}</span>
                    </div>

                    <div className="px-6 py-4 flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Publicações</span>
                      <span className="text-sm text-gray-900">
                        {campaignData.selectedPosts.length} selecionada(s)
                      </span>
                    </div>

                    <div className="px-6 py-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Monitoramento</span>
                        <span className="text-sm text-gray-900">
                          {campaignData.listenAllComments ? 'Todos os comentários' : 'Palavras-chave específicas'}
                        </span>
                      </div>
                      {!campaignData.listenAllComments && campaignData.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {campaignData.keywords.map(keyword => (
                            <Badge key={keyword} variant="secondary" className="text-xs">
                              #{keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="px-6 py-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Mensagem</span>
                        <span className="text-sm text-gray-900">
                          {campaignData.messageType === 'simple' && 'Mensagem Simples'}
                          {campaignData.messageType === 'link' && 'Mensagem com Link'}
                          {campaignData.messageType === 'button' && 'Mensagem com Botão'}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
                        {campaignData.messageContent}
                      </div>
                    </div>

                    {campaignData.messageType === 'link' && campaignData.linkUrl && (
                      <div className="px-6 py-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500">Link</span>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <p className="text-sm text-blue-800 break-all">{campaignData.linkUrl}</p>
                        </div>
                      </div>
                    )}

                    {campaignData.messageType === 'button' && campaignData.buttons.length > 0 && (
                      <div className="px-6 py-4">
                        <div className="flex justify-between mb-3">
                          <span className="text-sm font-medium text-gray-500">Botões Configurados</span>
                          <span className="text-sm text-gray-900">{campaignData.buttons.length}</span>
                        </div>
                        <div className="space-y-3">
                          {campaignData.buttons.map((button, index) => (
                            <div key={index} className="bg-green-50 border border-green-200 rounded p-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                                <div>
                                  <span className="font-medium text-green-800">Nome:</span>
                                  <p className="text-green-700">{button.name}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-green-800">Link:</span>
                                  <p className="text-green-700 break-all">{button.url}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-green-800">Resposta:</span>
                                  <p className="text-green-700">{button.responseMessage}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
