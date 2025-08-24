import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Trash2,
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
  Target,
  AlertTriangle,
  LinkIcon,
  MousePointer,
  ExternalLink,
  Check,
  Clock
} from "lucide-react";
import { getMVPAutomations, updateMVPAutomation, deleteMVPAutomation, type MVPAutomation } from "@/lib/mvp";
import { useAuth } from "@/providers/AuthProvider";

interface Button {
  name: string;
  url: string;
  responseMessage: string;
}

interface CommentInteraction {
  id: string;
  username: string;
  fullName: string;
  profileUrl: string;
  avatarUrl: string;
  comment: string;
  keyword: string;
  commentDate: string;
  dmSent: boolean;
  dmStatus: 'enviado' | 'entregue' | 'lido' | 'erro';
  postUrl: string;
}

// Gerar dados simulados de comentários
const generateCommentInteractions = (campaign: MVPAutomation): CommentInteraction[] => {
  const users = [
    { username: 'joao_silva', fullName: 'João Silva' },
    { username: 'maria_santos', fullName: 'Maria Santos' },
    { username: 'pedro_costa', fullName: 'Pedro Costa' },
    { username: 'ana_oliveira', fullName: 'Ana Oliveira' },
    { username: 'carlos_lima', fullName: 'Carlos Lima' },
    { username: 'lucia_ferreira', fullName: 'Lúcia Ferreira' },
    { username: 'bruno_alves', fullName: 'Bruno Alves' },
    { username: 'camila_rocha', fullName: 'Camila Rocha' },
    { username: 'rafael_mendes', fullName: 'Rafael Mendes' },
    { username: 'julia_castro', fullName: 'Júlia Castro' }
  ];

  const comments = [
    'Estou interessado neste produto!',
    'Qual o preço?',
    'Me manda mais informações por favor',
    'Quero comprar',
    'Tenho uma dúvida sobre isso',
    'Aceita cartão?',
    'Entrega para todo Brasil?',
    'Tem desconto?',
    'Como faço para adquirir?',
    'Disponível em outras cores?'
  ];

  const statuses: CommentInteraction['dmStatus'][] = ['enviado', 'entregue', 'lido', 'erro'];

  return Array.from({ length: 15 }, (_, i) => {
    const user = users[Math.floor(Math.random() * users.length)];
    const comment = comments[Math.floor(Math.random() * comments.length)];
    const keyword = campaign.listenAllComments 
      ? 'todos' 
      : campaign.keywords[Math.floor(Math.random() * campaign.keywords.length)] || 'interessado';
    
    return {
      id: `comment_${i}`,
      username: user.username,
      fullName: user.fullName,
      profileUrl: `https://instagram.com/${user.username}`,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`,
      comment,
      keyword,
      commentDate: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      dmSent: Math.random() > 0.2, // 80% chance de DM enviado
      dmStatus: statuses[Math.floor(Math.random() * statuses.length)],
      postUrl: campaign.postUrl
    };
  }).sort((a, b) => new Date(b.commentDate).getTime() - new Date(a.commentDate).getTime());
};

const CampaignDetails = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { isInMVPMode } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [campaign, setCampaign] = useState<MVPAutomation | null>(null);
  const [commentInteractions, setCommentInteractions] = useState<CommentInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Edit values
  const [editValues, setEditValues] = useState({
    name: '',
    keywords: [] as string[],
    newKeyword: '',
    listenAllComments: false,
    messageType: 'simple' as 'simple' | 'link' | 'button',
    messageContent: '',
    linkUrl: '',
    buttons: [] as Button[]
  });

  useEffect(() => {
    try {
      if (!campaignId) {
        setError('ID da campanha não fornecido');
        setLoading(false);
        return;
      }

      const campaigns = getMVPAutomations();
      const foundCampaign = campaigns.find(c => c.id === campaignId);
      
      if (foundCampaign) {
        setCampaign(foundCampaign);
        setEditValues({
          name: foundCampaign.name,
          keywords: [...foundCampaign.keywords],
          newKeyword: '',
          listenAllComments: foundCampaign.listenAllComments || false,
          messageType: foundCampaign.messageType || 'simple',
          messageContent: foundCampaign.dmTemplate,
          linkUrl: foundCampaign.linkUrl || '',
          buttons: foundCampaign.buttons ? [...foundCampaign.buttons] : []
        });
        setCommentInteractions(generateCommentInteractions(foundCampaign));
        setError(null);
      } else {
        setError('Campanha não encontrada');
      }
      
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar dados da campanha');
      setLoading(false);
    }
  }, [campaignId]);

  // Update campaign mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async (updates: Partial<MVPAutomation>) => {
      if (!campaign) throw new Error('Campanha não encontrada');
      
      if (isInMVPMode) {
        const success = updateMVPAutomation(campaign.id, updates);
        if (!success) throw new Error('Erro ao atualizar campanha MVP');
        return updates;
      }

      throw new Error('Modo produção não implementado');
    },
    onSuccess: (updates) => {
      if (campaign) {
        const updatedCampaign = { ...campaign, ...updates };
        setCampaign(updatedCampaign);
        // Atualizar dados de comentários se mudaram as palavras-chave
        if (updates.keywords || updates.listenAllComments !== undefined) {
          setCommentInteractions(generateCommentInteractions(updatedCampaign));
        }
      }
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      setEditingField(null);
      toast({
        title: "✅ Salvo com sucesso",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar campanha.",
        variant: "destructive",
      });
    }
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async () => {
      if (!campaign) throw new Error('Campanha não encontrada');
      
      if (isInMVPMode) {
        const success = deleteMVPAutomation(campaign.id);
        if (!success) throw new Error('Erro ao deletar campanha MVP');
        return true;
      }

      throw new Error('Modo produção não implementado');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast({
        title: "✅ Campanha excluída",
        description: "A campanha foi excluída com sucesso.",
      });
      navigate('/campaigns');
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir campanha.",
        variant: "destructive",
      });
    }
  });

  const handleSave = (field: string) => {
    if (!campaign) return;

    let updates: Partial<MVPAutomation> = {};

    switch (field) {
      case 'name':
        if (editValues.name.trim()) {
          updates.name = editValues.name.trim();
        }
        break;
      case 'keywords':
        updates.keywords = editValues.keywords;
        updates.listenAllComments = editValues.listenAllComments;
        break;
      case 'message':
        updates.dmTemplate = editValues.messageContent;
        updates.messageType = editValues.messageType;
        updates.linkUrl = editValues.linkUrl;
        updates.buttons = editValues.buttons;
        break;
      case 'status':
        updates.active = !campaign.active;
        break;
    }

    updateCampaignMutation.mutate(updates);
  };

  const handleToggleStatus = () => {
    handleSave('status');
  };

  const handleDeleteCampaign = () => {
    deleteCampaignMutation.mutate();
  };

  const handleAddKeyword = () => {
    const keyword = editValues.newKeyword.trim().toLowerCase();
    if (keyword && !editValues.keywords.includes(keyword)) {
      setEditValues(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword],
        newKeyword: ''
      }));
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setEditValues(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleAddButton = () => {
    if (editValues.buttons.length < 2) {
      setEditValues(prev => ({
        ...prev,
        buttons: [...prev.buttons, { name: '', url: '', responseMessage: '' }]
      }));
    }
  };

  const handleUpdateButton = (index: number, field: keyof Button, value: string) => {
    setEditValues(prev => ({
      ...prev,
      buttons: prev.buttons.map((button, i) => 
        i === index ? { ...button, [field]: value } : button
      )
    }));
  };

  const handleRemoveButton = (index: number) => {
    setEditValues(prev => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: CommentInteraction['dmStatus']) => {
    const variants = {
      enviado: { color: "bg-blue-100 text-blue-800", icon: Send },
      entregue: { color: "bg-green-100 text-green-800", icon: Check },
      lido: { color: "bg-purple-100 text-purple-800", icon: Eye },
      erro: { color: "bg-red-100 text-red-800", icon: AlertTriangle }
    };

    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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

  // Calculate metrics
  const totalComments = commentInteractions.length;
  const totalDMsSent = commentInteractions.filter(c => c.dmSent).length;
  const successRate = totalComments > 0 ? ((totalDMsSent / totalComments) * 100).toFixed(1) : "0";

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
              disabled={updateCampaignMutation.isPending}
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
                      {editingField === 'name' ? (
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            value={editValues.name}
                            onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                            className="flex-1"
                            onKeyPress={(e) => e.key === 'Enter' && handleSave('name')}
                          />
                          <Button size="sm" onClick={() => handleSave('name')} disabled={updateCampaignMutation.isPending}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between mt-1">
                          <p className="font-medium">{campaign.name}</p>
                          <Button size="sm" variant="outline" onClick={() => setEditingField('name')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
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
                      <Label className="text-sm font-medium text-gray-500">Tipo de Monitoramento</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        {campaign.listenAllComments ? (
                          <Badge className="bg-blue-100 text-blue-800 border-0">
                            <Hash className="w-3 h-3 mr-1" />
                            Todos os comentários
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-0">
                            <Hash className="w-3 h-3 mr-1" />
                            Palavras-chave específicas
                          </Badge>
                        )}
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
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Configurações da Campanha</span>
                  </div>
                  {editingField !== 'message' && (
                    <Button size="sm" variant="outline" onClick={() => setEditingField('message')}>
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Configure a mensagem e ações automáticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingField === 'message' ? (
                  <div className="space-y-6">
                    <div>
                      <Label>Tipo de Mensagem</Label>
                      <Select
                        value={editValues.messageType}
                        onValueChange={(value: any) => setEditValues(prev => ({ ...prev, messageType: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">
                            <div className="flex items-center space-x-2">
                              <MessageCircle className="w-4 h-4" />
                              <span>Mensagem Simples</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="link">
                            <div className="flex items-center space-x-2">
                              <LinkIcon className="w-4 h-4" />
                              <span>Mensagem com Link</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="button">
                            <div className="flex items-center space-x-2">
                              <MousePointer className="w-4 h-4" />
                              <span>Mensagem com Botão</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Mensagem de DM</Label>
                      <Textarea
                        value={editValues.messageContent}
                        onChange={(e) => setEditValues(prev => ({ ...prev, messageContent: e.target.value }))}
                        rows={4}
                        className="mt-1"
                        placeholder="Oi! Vi que você comentou no meu post..."
                      />
                    </div>

                    {editValues.messageType === 'link' && (
                      <div>
                        <Label>Link</Label>
                        <Input
                          type="url"
                          value={editValues.linkUrl}
                          onChange={(e) => setEditValues(prev => ({ ...prev, linkUrl: e.target.value }))}
                          className="mt-1"
                          placeholder="https://meusite.com"
                        />
                      </div>
                    )}

                    {editValues.messageType === 'button' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Botões (máx. 2)</Label>
                          <Button
                            size="sm"
                            onClick={handleAddButton}
                            disabled={editValues.buttons.length >= 2}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>

                        {editValues.buttons.map((button, index) => (
                          <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Botão {index + 1}</span>
                              <Button size="sm" variant="destructive" onClick={() => handleRemoveButton(index)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-sm">Nome</Label>
                                <Input
                                  value={button.name}
                                  onChange={(e) => handleUpdateButton(index, 'name', e.target.value)}
                                  placeholder="Ver Oferta"
                                />
                              </div>
                              <div>
                                <Label className="text-sm">URL</Label>
                                <Input
                                  type="url"
                                  value={button.url}
                                  onChange={(e) => handleUpdateButton(index, 'url', e.target.value)}
                                  placeholder="https://exemplo.com"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm">Mensagem de Resposta</Label>
                              <Textarea
                                value={button.responseMessage}
                                onChange={(e) => handleUpdateButton(index, 'responseMessage', e.target.value)}
                                placeholder="Obrigado pelo interesse!"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button onClick={() => handleSave('message')} disabled={updateCampaignMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </Button>
                      <Button variant="outline" onClick={() => setEditingField(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tipo de Mensagem</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        {campaign.messageType === 'simple' && <MessageCircle className="w-4 h-4 text-blue-500" />}
                        {campaign.messageType === 'link' && <LinkIcon className="w-4 h-4 text-blue-500" />}
                        {campaign.messageType === 'button' && <MousePointer className="w-4 h-4 text-blue-500" />}
                        <span>
                          {campaign.messageType === 'simple' && 'Mensagem Simples'}
                          {campaign.messageType === 'link' && 'Mensagem com Link'}
                          {campaign.messageType === 'button' && 'Mensagem com Botão'}
                        </span>
                      </div>
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Keywords & Analytics */}
          <div className="space-y-6">
            {/* Palavras-Chave */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-5 h-5" />
                    <span>Palavras-Chave</span>
                  </div>
                  {editingField !== 'keywords' && (
                    <Button size="sm" variant="outline" onClick={() => setEditingField('keywords')}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Configure como monitorar comentários
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingField === 'keywords' ? (
                  <div className="space-y-4">
                    {/* Toggle for listen all comments */}
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">Todos os comentários</p>
                        <p className="text-xs text-gray-500">Responder a qualquer comentário</p>
                      </div>
                      <Switch
                        checked={editValues.listenAllComments}
                        onCheckedChange={(checked) => setEditValues(prev => ({
                          ...prev,
                          listenAllComments: checked
                        }))}
                      />
                    </div>

                    {!editValues.listenAllComments && (
                      <>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Nova palavra-chave..."
                            value={editValues.newKeyword}
                            onChange={(e) => setEditValues(prev => ({ ...prev, newKeyword: e.target.value }))}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                          />
                          <Button onClick={handleAddKeyword} size="sm" disabled={!editValues.newKeyword.trim()}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {editValues.keywords.map(keyword => (
                            <div key={keyword} className="flex items-center justify-between p-2 bg-green-50 rounded border">
                              <span className="text-sm font-medium">#{keyword}</span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleRemoveKeyword(keyword)}
                              >
                                <X className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="flex space-x-2">
                      <Button onClick={() => handleSave('keywords')} size="sm" disabled={updateCampaignMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setEditingField(null)} size="sm">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {campaign.listenAllComments ? (
                      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium">Todos os comentários</span>
                        </div>
                        <Badge variant="secondary">∞</Badge>
                      </div>
                    ) : (
                      <>
                        <Badge variant="secondary">{campaign.keywords.length} ativas</Badge>
                        {campaign.keywords.map(keyword => (
                          <div key={keyword} className="flex items-center justify-between p-2 bg-green-50 rounded">
                            <span className="text-sm font-medium">#{keyword}</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
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
                    <span className="font-bold">{totalComments}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4 text-green-500" />
                      <span className="text-sm">DMs Enviadas</span>
                    </div>
                    <span className="font-bold">{totalDMsSent}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Taxa de Sucesso</span>
                    </div>
                    <span className="font-bold">{successRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aç��es */}
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
                  disabled={updateCampaignMutation.isPending}
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
                
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleteCampaignMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Campanha
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comentários Section - Full Width */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Comentários Recebidos</span>
            </CardTitle>
            <CardDescription>
              Lista de todos os comentários detectados e ações tomadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Comentário</TableHead>
                    <TableHead>Palavra-chave</TableHead>
                    <TableHead>DM Enviado</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commentInteractions.map((interaction) => (
                    <TableRow key={interaction.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs">
                              {interaction.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">@{interaction.username}</p>
                            <p className="text-xs text-gray-500">{interaction.fullName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm truncate" title={interaction.comment}>
                          {interaction.comment}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {interaction.keyword === 'todos' ? 'todos' : `#${interaction.keyword}`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {interaction.dmSent ? (
                          getStatusBadge(interaction.dmStatus)
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Não enviado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(interaction.commentDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="outline" asChild>
                            <a href={interaction.profileUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href={interaction.postUrl} target="_blank" rel="noopener noreferrer">
                              <Instagram className="w-3 h-3" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {commentInteractions.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum comentário ainda
                </h3>
                <p className="text-gray-500">
                  Os comentários aparecerão aqui quando a campanha estiver ativa e receber interações.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Confirmar Exclusão</span>
              </DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir a campanha "{campaign.name}"? 
                Esta ação não pode ser desfeita e todos os dados serão perdidos permanentemente.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteCampaign}
                disabled={deleteCampaignMutation.isPending}
              >
                {deleteCampaignMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Confirmar Exclusão
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CampaignDetails;
