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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  ExternalLink,
  Instagram,
  MessageCircle,
  Send,
  Eye,
  Users,
  TrendingUp,
  Hash,
  Copy,
  Check,
  Image,
  BarChart3,
  Settings,
  Activity,
  Target
} from "lucide-react";
import { getMVPAutomations, updateMVPAutomation, type MVPAutomation } from "@/lib/mvp";
import { useAuth } from "@/providers/AuthProvider";

interface UserInteraction {
  id: string;
  username: string;
  fullName: string;
  followers: number;
  profileUrl: string;
  keyword: string;
  comment: string;
  commentTime: string;
  messageStatus: 'enviada' | 'entregue' | 'lida' | 'erro';
  dmSentTime?: string;
  clicked: boolean;
  converted: boolean;
}

interface Button {
  name: string;
  url: string;
  responseMessage: string;
}

const generateUserInteractions = (campaignId: string): UserInteraction[] => {
  const users = [
    { username: 'joao_silva', fullName: 'João Silva', followers: 2534 },
    { username: 'maria_santos', fullName: 'Maria Santos', followers: 892 },
    { username: 'pedro_costa', fullName: 'Pedro Costa', followers: 1456 },
    { username: 'ana_oliveira', fullName: 'Ana Oliveira', followers: 634 },
    { username: 'carlos_lima', fullName: 'Carlos Lima', followers: 3201 },
    { username: 'lucia_ferreira', fullName: 'Lúcia Ferreira', followers: 567 },
    { username: 'bruno_alves', fullName: 'Bruno Alves', followers: 1890 },
    { username: 'camila_rocha', fullName: 'Camila Rocha', followers: 445 },
    { username: 'rafael_mendes', fullName: 'Rafael Mendes', followers: 2187 },
    { username: 'julia_castro', fullName: 'Júlia Castro', followers: 756 }
  ];

  const keywords = ['interessado', 'preço', 'info', 'comprar', 'dúvida'];
  const statuses: UserInteraction['messageStatus'][] = ['enviada', 'entregue', 'lida', 'erro'];
  const comments = [
    'Estou interessado neste produto!',
    'Qual o preço?',
    'Me manda mais informações',
    'Quero comprar',
    'Tenho uma dúvida sobre o produto'
  ];

  return Array.from({ length: 12 }, (_, i) => {
    const user = users[Math.floor(Math.random() * users.length)];
    const commentTime = new Date(Date.now() - Math.random() * 86400000 * 7);
    
    return {
      id: `interaction_${campaignId}_${i}`,
      username: user.username,
      fullName: user.fullName,
      followers: user.followers,
      profileUrl: `https://instagram.com/${user.username}`,
      keyword: keywords[Math.floor(Math.random() * keywords.length)],
      comment: comments[Math.floor(Math.random() * comments.length)],
      commentTime: commentTime.toISOString(),
      messageStatus: statuses[Math.floor(Math.random() * statuses.length)],
      dmSentTime: new Date(commentTime.getTime() + Math.random() * 3600000).toISOString(),
      clicked: Math.random() > 0.6,
      converted: Math.random() > 0.8
    };
  }).sort((a, b) => new Date(b.commentTime).getTime() - new Date(a.commentTime).getTime());
};

const CampaignDetails = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { isInMVPMode } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [campaign, setCampaign] = useState<MVPAutomation | null>(null);
  const [userInteractions, setUserInteractions] = useState<UserInteraction[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    name: '',
    keywords: [] as string[],
    newKeyword: '',
    messageType: 'simple' as 'simple' | 'link' | 'button',
    messageContent: '',
    linkUrl: '',
    buttons: [] as Button[]
  });
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!campaignId) return;

    const campaigns = getMVPAutomations();
    const foundCampaign = campaigns.find(c => c.id === campaignId);
    
    if (foundCampaign) {
      setCampaign(foundCampaign);
      setEditValues({
        name: foundCampaign.name,
        keywords: [...foundCampaign.keywords],
        newKeyword: '',
        messageType: foundCampaign.messageType || 'simple',
        messageContent: foundCampaign.dmTemplate,
        linkUrl: foundCampaign.linkUrl || '',
        buttons: foundCampaign.buttons ? [...foundCampaign.buttons] : []
      });
      setUserInteractions(generateUserInteractions(campaignId));
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
      }
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      setEditingSection(null);
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

  const handleSave = (section: string) => {
    if (!campaign) return;

    let updates: Partial<MVPAutomation> = {};

    switch (section) {
      case 'name':
        if (editValues.name.trim()) {
          updates.name = editValues.name.trim();
        }
        break;
      case 'keywords':
        updates.keywords = editValues.keywords;
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

  const handleToggleKeyword = (keyword: string, enabled: boolean) => {
    if (enabled) {
      if (!editValues.keywords.includes(keyword)) {
        setEditValues(prev => ({
          ...prev,
          keywords: [...prev.keywords, keyword]
        }));
      }
    } else {
      setEditValues(prev => ({
        ...prev,
        keywords: prev.keywords.filter(k => k !== keyword)
      }));
    }
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copiado!",
        description: "Link copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: UserInteraction['messageStatus']) => {
    const variants = {
      enviada: { color: "bg-blue-100 text-blue-800", text: "Enviada" },
      entregue: { color: "bg-green-100 text-green-800", text: "Entregue" },
      lida: { color: "bg-purple-100 text-purple-800", text: "Lida" },
      erro: { color: "bg-red-100 text-red-800", text: "Erro" }
    };

    const config = variants[status];
    return (
      <Badge className={`${config.color} border-0`}>
        {config.text}
      </Badge>
    );
  };

  // Calculate metrics
  const totalInteractions = userInteractions.length;
  const sentMessages = userInteractions.filter(u => u.messageStatus !== 'erro').length;
  const totalClicks = userInteractions.filter(u => u.clicked).length;
  const totalConversions = userInteractions.filter(u => u.converted).length;

  if (!campaign) {
    return <Navigate to="/campaigns" replace />;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
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
              onClick={() => handleSave('status')}
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
                      <p className="font-medium">Publicação em 15/01/2024</p>
                      <p className="text-gray-600">39 comentários detectados</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => copyToClipboard(campaign.postUrl)}
                      >
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        Copiar Link do Post
                      </Button>
                    </div>
                  </div>

                  {/* Campaign Info */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nome da Campanha</Label>
                      {editingSection === 'name' ? (
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            value={editValues.name}
                            onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={() => handleSave('name')}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingSection(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between mt-1">
                          <p className="font-medium">{campaign.name}</p>
                          <Button size="sm" variant="outline" onClick={() => setEditingSection('name')}>
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
                      <Label className="text-sm font-medium text-gray-500">Criada em</Label>
                      <p className="mt-1">{formatDate(campaign.createdAt)}</p>
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
                  Configure a mensagem e ações automáticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingSection === 'message' ? (
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
                          <SelectItem value="simple">Mensagem Simples</SelectItem>
                          <SelectItem value="link">Mensagem com Link</SelectItem>
                          <SelectItem value="button">Mensagem com Botão</SelectItem>
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
                          <div key={index} className="p-4 border rounded-lg space-y-3">
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
                      <Button onClick={() => handleSave('message')}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </Button>
                      <Button variant="outline" onClick={() => setEditingSection(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Tipo: {campaign.messageType === 'simple' && 'Mensagem Simples'}
                          {campaign.messageType === 'link' && 'Mensagem com Link'}
                          {campaign.messageType === 'button' && 'Mensagem com Botão'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {campaign.dmTemplate}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setEditingSection('message')}>
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </div>

                    {campaign.messageType === 'link' && campaign.linkUrl && (
                      <div className="p-3 bg-blue-50 rounded border">
                        <p className="text-sm text-blue-600 break-all">{campaign.linkUrl}</p>
                      </div>
                    )}

                    {campaign.messageType === 'button' && campaign.buttons && campaign.buttons.length > 0 && (
                      <div className="space-y-2">
                        {campaign.buttons.map((button: any, index: number) => (
                          <div key={index} className="p-3 bg-green-50 rounded border">
                            <p className="text-sm font-medium">{button.name}</p>
                            <p className="text-xs text-gray-600 break-all">{button.url}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Log de DMs Enviadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Log de DMs Enviadas</span>
                </CardTitle>
                <CardDescription>
                  Histórico de mensagens enviadas automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Palavra-chave</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userInteractions.slice(0, 8).map((interaction) => (
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
                                <p className="text-xs text-gray-500">{interaction.followers.toLocaleString()} seguidores</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              #{interaction.keyword}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(interaction.messageStatus)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(interaction.commentTime)}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" asChild>
                              <a href={interaction.profileUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                  Configure quais palavras ativam as automações
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingSection === 'keywords' ? (
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Nova palavra-chave..."
                        value={editValues.newKeyword}
                        onChange={(e) => setEditValues(prev => ({ ...prev, newKeyword: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                      />
                      <Button onClick={handleAddKeyword} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {['info', 'preço', 'interessado', 'comprar', 'dúvida'].map(keyword => (
                        <div key={keyword} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">#{keyword}</span>
                          <Switch
                            checked={editValues.keywords.includes(keyword)}
                            onCheckedChange={(checked) => handleToggleKeyword(keyword, checked)}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={() => handleSave('keywords')} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setEditingSection(null)} size="sm">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{campaign.keywords.length} ativas</Badge>
                      <Button size="sm" variant="outline" onClick={() => setEditingSection('keywords')}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {campaign.keywords.map(keyword => (
                        <div key={keyword} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm font-medium">#{keyword}</span>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      ))}
                    </div>
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
                    <span className="font-bold">{totalInteractions}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Send className="w-4 h-4 text-green-500" />
                      <span className="text-sm">DMs Enviadas</span>
                    </div>
                    <span className="font-bold">{sentMessages}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span className="text-sm">Taxa de Envio</span>
                    </div>
                    <span className="font-bold">
                      {totalInteractions > 0 ? ((sentMessages / totalInteractions) * 100).toFixed(0) : 0}%
                    </span>
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
                  onClick={() => handleSave('status')}
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
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir esta campanha?')) {
                      // TODO: Implement delete
                      navigate('/campaigns');
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Campanha
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
