import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Play,
  Pause,
  Edit,
  Save,
  X,
  Plus,
  Instagram,
  MessageCircle,
  Send,
  Eye,
  Users,
  TrendingUp,
  Hash,
  Image,
  BarChart3,
  Settings,
  Activity,
  Target
} from "lucide-react";
import { getMVPAutomations, updateMVPAutomation, type MVPAutomation } from "@/lib/mvp";
import { useAuth } from "@/providers/AuthProvider";

const CampaignDetails = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { isInMVPMode } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [campaign, setCampaign] = useState<MVPAutomation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('CampaignDetails carregado - campaignId:', campaignId);
  console.log('Modo MVP:', isInMVPMode);

  useEffect(() => {
    try {
      console.log('useEffect executando - buscando campanha...');
      
      if (!campaignId) {
        console.log('Nenhum campaignId fornecido');
        setError('ID da campanha não fornecido');
        setLoading(false);
        return;
      }

      const campaigns = getMVPAutomations();
      console.log('Campanhas disponíveis:', campaigns);
      
      const foundCampaign = campaigns.find(c => c.id === campaignId);
      console.log('Campanha encontrada:', foundCampaign);
      
      if (foundCampaign) {
        setCampaign(foundCampaign);
        setError(null);
      } else {
        setError('Campanha não encontrada');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar campanha:', err);
      setError('Erro ao carregar dados da campanha');
      setLoading(false);
    }
  }, [campaignId]);

  const handleToggleStatus = () => {
    if (!campaign) return;
    
    try {
      const newStatus = !campaign.active;
      const success = updateMVPAutomation(campaign.id, { active: newStatus });
      
      if (success) {
        setCampaign({ ...campaign, active: newStatus });
        toast({
          title: newStatus ? "Campanha ativada" : "Campanha pausada",
          description: newStatus 
            ? "A campanha voltará a enviar DMs automaticamente."
            : "A campanha foi pausada e não enviará mais DMs.",
        });
      }
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da campanha.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando detalhes da campanha...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="mb-6">
            <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Campanha não encontrada'}
            </h2>
            <p className="text-gray-600 mb-6">
              Não foi possível carregar os detalhes desta campanha.
            </p>
            <Button onClick={() => navigate('/campaigns')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Campanhas
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  console.log('Renderizando página de detalhes para campanha:', campaign.name);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/campaigns')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalhes da Campanha</h1>
              <p className="text-gray-600">Gerencie e monitore sua automação</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleToggleStatus}
              variant={campaign.active ? "destructive" : "default"}
            >
              {campaign.active ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar Campanha
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Ativar Campanha
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visão Geral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="w-5 h-5" />
                  <span>Visão Geral</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Post Preview */}
                  <div className="space-y-4">
                    <div className="w-full h-64 bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-4 bg-white rounded-lg flex items-center justify-center">
                        <Instagram className="w-16 h-16 text-gray-400" />
                      </div>
                    </div>
                    <div className="text-sm space-y-2">
                      <p className="font-medium">Publicação monitorada</p>
                      <p className="text-gray-600">Status: {campaign.active ? 'Ativa' : 'Pausada'}</p>
                      <a 
                        href={campaign.postUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm break-all"
                      >
                        {campaign.postUrl}
                      </a>
                    </div>
                  </div>

                  {/* Campaign Info */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nome da Campanha</Label>
                      <p className="font-medium mt-1">{campaign.name}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={campaign.active ? "default" : "secondary"}>
                          <Activity className="w-3 h-3 mr-1" />
                          {campaign.active ? "Ativa" : "Pausada"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Criada em</Label>
                      <p className="mt-1">
                        {new Date(campaign.createdAt).toLocaleDateString("pt-BR", {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Conta</Label>
                      <p className="mt-1">{campaign.accountName}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurações da Campanha */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Configurações da Campanha</span>
                </CardTitle>
                <CardDescription>
                  Mensagem automática configurada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tipo de Mensagem</Label>
                    <p className="mt-1 capitalize">
                      {campaign.messageType === 'simple' && 'Mensagem Simples'}
                      {campaign.messageType === 'link' && 'Mensagem com Link'}
                      {campaign.messageType === 'button' && 'Mensagem com Botão'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Conteúdo</Label>
                    <div className="p-4 bg-gray-50 rounded-lg border mt-1">
                      <p className="text-sm whitespace-pre-wrap">{campaign.dmTemplate}</p>
                    </div>
                  </div>

                  {campaign.messageType === 'link' && campaign.linkUrl && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Link</Label>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded mt-1">
                        <a 
                          href={campaign.linkUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 break-all text-sm"
                        >
                          {campaign.linkUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  {campaign.messageType === 'button' && campaign.buttons && campaign.buttons.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Botões Configurados</Label>
                      <div className="space-y-2 mt-1">
                        {campaign.buttons.map((button: any, index: number) => (
                          <div key={index} className="p-3 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm font-medium">📱 {button.name}</p>
                            <p className="text-xs text-gray-600 break-all">🔗 {button.url}</p>
                            <p className="text-xs text-gray-600 mt-1">💬 {button.responseMessage}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Keywords & Analytics */}
          <div className="space-y-6">
            {/* Palavras-Chave */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hash className="w-5 h-5" />
                  <span>Palavras-Chave</span>
                </CardTitle>
                <CardDescription>
                  Palavras que ativam as automações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary">{campaign.keywords.length} ativas</Badge>
                  {campaign.keywords.map(keyword => (
                    <div key={keyword} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium">#{keyword}</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Análise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Análise</span>
                </CardTitle>
                <CardDescription>
                  Métricas desta campanha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Comentários Detectados</span>
                    </div>
                    <span className="font-bold">0</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4 text-green-500" />
                      <span className="text-sm">DMs Enviadas</span>
                    </div>
                    <span className="font-bold">0</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Taxa de Envio</span>
                    </div>
                    <span className="font-bold">0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Ações</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleToggleStatus}
                >
                  {campaign.active ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar Campanha
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Ativar Campanha
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CampaignDetails;
