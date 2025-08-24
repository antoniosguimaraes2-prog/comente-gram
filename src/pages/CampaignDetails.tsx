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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  MessageCircle, 
  Send, 
  TrendingUp, 
  Users, 
  Eye,
  Clock,
  Heart,
  Zap,
  ArrowLeft,
  Play,
  Pause,
  Download,
  Edit,
  Trash2,
  Plus,
  X,
  Save,
  Image,
  Video,
  LinkIcon,
  MousePointer,
  Hash,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Activity,
  Target,
  Share2,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { getMVPAutomations, updateMVPAutomation, type MVPAutomation } from "@/lib/mvp";
import { useAuth } from "@/providers/AuthProvider";

interface UserInteraction {
  id: string;
  username: string;
  fullName: string;
  followers: number;
  profileUrl: string;
  avatarUrl?: string;
  keyword: string;
  comment: string;
  commentTime: string;
  messageStatus: 'sent' | 'delivered' | 'read' | 'error' | 'pending';
  dmSentTime?: string;
  clicked: boolean;
  converted: boolean;
  lastActivity: string;
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
    { username: 'julia_castro', fullName: 'Júlia Castro', followers: 756 },
    { username: 'fernando_silva', fullName: 'Fernando Silva', followers: 1234 },
    { username: 'patricia_lima', fullName: 'Patrícia Lima', followers: 987 },
    { username: 'rodrigo_santos', fullName: 'Rodrigo Santos', followers: 2345 },
    { username: 'amanda_costa', fullName: 'Amanda Costa', followers: 1567 },
    { username: 'gabriel_oliveira', fullName: 'Gabriel Oliveira', followers: 876 }
  ];

  const keywords = ['interessado', 'preço', 'info', 'comprar', 'dúvida', 'quero', 'valor', 'disponível'];
  const statuses: UserInteraction['messageStatus'][] = ['sent', 'delivered', 'read', 'error', 'pending'];
  const comments = [
    'Estou interessado neste produto!',
    'Qual o preço?',
    'Me manda mais informações',
    'Quero comprar',
    'Tenho uma dúvida',
    'Está disponível?',
    'Como faço para adquirir?',
    'Aceita cartão?',
    'Tem desconto?',
    'Entrega para todo Brasil?'
  ];

  return Array.from({ length: 20 }, (_, i) => {
    const user = users[Math.floor(Math.random() * users.length)];
    const commentTime = new Date(Date.now() - Math.random() * 86400000 * 7);
    const dmTime = new Date(commentTime.getTime() + Math.random() * 3600000);
    
    return {
      id: `interaction_${campaignId}_${i}`,
      username: user.username,
      fullName: user.fullName,
      followers: user.followers,
      profileUrl: `https://instagram.com/${user.username}`,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`,
      keyword: keywords[Math.floor(Math.random() * keywords.length)],
      comment: comments[Math.floor(Math.random() * comments.length)],
      commentTime: commentTime.toISOString(),
      messageStatus: statuses[Math.floor(Math.random() * statuses.length)],
      dmSentTime: dmTime.toISOString(),
      clicked: Math.random() > 0.6,
      converted: Math.random() > 0.8,
      lastActivity: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString()
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
  const [editingField, setEditingField] = useState<string | null>(null);
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'delivered' | 'read' | 'error'>('all');
  const [searchUser, setSearchUser] = useState('');

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

      // TODO: Implement real API call for production mode
      throw new Error('Modo produção não implementado');
    },
    onSuccess: (updates) => {
      if (campaign) {
        const updatedCampaign = { ...campaign, ...updates };
        setCampaign(updatedCampaign);
      }
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      setEditingField(null);
      toast({
        title: "✅ Atualizado com sucesso",
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

  const handleSaveField = (field: string) => {
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const getStatusBadge = (status: UserInteraction['messageStatus']) => {
    const variants = {
      sent: { variant: "secondary" as const, text: "Enviada", icon: Send },
      delivered: { variant: "default" as const, text: "Entregue", icon: Check },
      read: { variant: "default" as const, text: "Lida", className: "bg-green-500", icon: Eye },
      error: { variant: "destructive" as const, text: "Erro", icon: AlertTriangle },
      pending: { variant: "secondary" as const, text: "Pendente", icon: Clock }
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  // Filter interactions
  const filteredInteractions = userInteractions.filter(interaction => {
    const matchesStatus = filterStatus === 'all' || interaction.messageStatus === filterStatus;
    const matchesSearch = !searchUser || 
      interaction.username.toLowerCase().includes(searchUser.toLowerCase()) ||
      interaction.fullName.toLowerCase().includes(searchUser.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate metrics
  const totalInteractions = userInteractions.length;
  const sentMessages = userInteractions.filter(u => u.messageStatus !== 'error' && u.messageStatus !== 'pending').length;
  const totalClicks = userInteractions.filter(u => u.clicked).length;
  const totalConversions = userInteractions.filter(u => u.converted).length;
  const readMessages = userInteractions.filter(u => u.messageStatus === 'read').length;
  
  const clickRate = sentMessages > 0 ? ((totalClicks / sentMessages) * 100).toFixed(1) : "0.0";
  const conversionRate = sentMessages > 0 ? ((totalConversions / sentMessages) * 100).toFixed(1) : "0.0";
  const readRate = sentMessages > 0 ? ((readMessages / sentMessages) * 100).toFixed(1) : "0.0";

  if (!campaign) {
    return <Navigate to="/campaigns" replace />;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                {editingField === 'name' ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={editValues.name}
                      onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                      className="text-2xl font-bold h-10 w-80"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveField('name')}
                    />
                    <Button size="sm" onClick={() => handleSaveField('name')}>
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold">{campaign.name}</h1>
                    <Button size="sm" variant="outline" onClick={() => setEditingField('name')}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <Badge variant="secondary">
                  <Zap className="w-3 h-3 mr-1" />
                  {isInMVPMode ? 'Modo MVP' : 'Produção'}
                </Badge>
                
                <Badge variant={campaign.active ? "default" : "secondary"}>
                  <Activity className="w-3 h-3 mr-1" />
                  {campaign.active ? "Ativa" : "Pausada"}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Criada em {formatDate(campaign.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>{campaign.accountName}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button
              onClick={() => handleSaveField('status')}
              variant={campaign.active ? "destructive" : "default"}
              disabled={updateCampaignMutation.isPending}
            >
              {campaign.active ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Ativar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Interações</p>
                  <p className="text-2xl font-bold">{totalInteractions}</p>
                </div>
                <MessageCircle className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">DMs Enviadas</p>
                  <p className="text-2xl font-bold">{sentMessages}</p>
                </div>
                <Send className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Taxa Leitura</p>
                  <p className="text-2xl font-bold">{readRate}%</p>
                </div>
                <Eye className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Cliques</p>
                  <p className="text-2xl font-bold">{totalClicks}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Taxa Clique</p>
                  <p className="text-2xl font-bold">{clickRate}%</p>
                </div>
                <BarChart3 className="w-6 h-6 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Conversões</p>
                  <p className="text-2xl font-bold">{conversionRate}%</p>
                </div>
                <Users className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Image className="w-5 h-5" />
                <span>Publicações Monitoradas</span>
              </CardTitle>
              <Badge variant="secondary">1 publicação</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg flex items-center justify-center">
                <Image className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Post Principal</p>
                <p className="text-sm text-gray-600 break-all mb-2">{campaign.postUrl}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{totalInteractions} interações</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Send className="w-3 h-3" />
                    <span>{sentMessages} DMs enviadas</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Activity className="w-3 h-3" />
                    <span>{campaign.active ? 'Ativa' : 'Pausada'}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(campaign.postUrl)}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={campaign.postUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keywords Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Hash className="w-5 h-5" />
                <span>Palavras-chave</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{editValues.keywords.length} palavra(s)</Badge>
                {editingField !== 'keywords' && (
                  <Button size="sm" variant="outline" onClick={() => setEditingField('keywords')}>
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editingField === 'keywords' ? (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nova palavra-chave..."
                    value={editValues.newKeyword}
                    onChange={(e) => setEditValues(prev => ({ ...prev, newKeyword: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  />
                  <Button onClick={handleAddKeyword} disabled={!editValues.newKeyword.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {editValues.keywords.map(keyword => (
                    <div key={keyword} className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1">
                      <Hash className="w-3 h-3 mr-1" />
                      <span className="text-sm">{keyword}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-auto p-0 ml-2 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveKeyword(keyword)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Button onClick={() => handleSaveField('keywords')}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setEditingField(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {campaign.keywords.map(keyword => (
                  <Badge key={keyword} variant="secondary" className="flex items-center">
                    <Hash className="w-3 h-3 mr-1" />
                    {keyword}
                  </Badge>
                ))}
                {campaign.keywords.length === 0 && (
                  <p className="text-gray-500 text-sm">Nenhuma palavra-chave configurada</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Configuração da Mensagem</span>
              </CardTitle>
              {editingField !== 'message' && (
                <Button size="sm" variant="outline" onClick={() => setEditingField('message')}>
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingField === 'message' ? (
              <div className="space-y-6">
                {/* Message Type */}
                <div className="space-y-2">
                  <Label>Tipo de Mensagem</Label>
                  <Select 
                    value={editValues.messageType} 
                    onValueChange={(value: any) => setEditValues(prev => ({ ...prev, messageType: value }))}
                  >
                    <SelectTrigger>
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

                {/* Message Content */}
                <div className="space-y-2">
                  <Label>Conteúdo da Mensagem</Label>
                  <Textarea
                    value={editValues.messageContent}
                    onChange={(e) => setEditValues(prev => ({ ...prev, messageContent: e.target.value }))}
                    rows={4}
                    placeholder="Oi {first_name}! Vi seu interesse no meu post..."
                  />
                </div>

                {/* Link Configuration */}
                {editValues.messageType === 'link' && (
                  <div className="space-y-2">
                    <Label>URL do Link</Label>
                    <Input
                      type="url"
                      value={editValues.linkUrl}
                      onChange={(e) => setEditValues(prev => ({ ...prev, linkUrl: e.target.value }))}
                      placeholder="https://meusite.com/oferta"
                    />
                  </div>
                )}

                {/* Button Configuration */}
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
                          <Label>Botão {index + 1}</Label>
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
                              placeholder="Ex: Ver Oferta"
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
                  <Button onClick={() => handleSaveField('message')} disabled={updateCampaignMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Mensagem
                  </Button>
                  <Button variant="outline" onClick={() => setEditingField(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {campaign.messageType === 'simple' && <MessageCircle className="w-5 h-5 text-blue-500" />}
                  {campaign.messageType === 'link' && <LinkIcon className="w-5 h-5 text-blue-500" />}
                  {campaign.messageType === 'button' && <MousePointer className="w-5 h-5 text-blue-500" />}
                  <span className="font-medium">
                    {campaign.messageType === 'simple' && 'Mensagem Simples'}
                    {campaign.messageType === 'link' && 'Mensagem com Link'}
                    {campaign.messageType === 'button' && 'Mensagem com Botão'}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap">{campaign.dmTemplate}</p>
                </div>

                {campaign.messageType === 'link' && campaign.linkUrl && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-600 break-all">{campaign.linkUrl}</p>
                  </div>
                )}

                {campaign.messageType === 'button' && campaign.buttons && campaign.buttons.length > 0 && (
                  <div className="space-y-2">
                    {campaign.buttons.map((button: any, index: number) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded">
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">📱 {button.name}</span></p>
                          <p className="text-gray-600 break-all">🔗 {button.url}</p>
                          <p className="text-gray-600">💬 {button.responseMessage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Interactions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Interações dos Usuários</span>
                </CardTitle>
                <CardDescription>
                  Usuários que comentaram e receberam DMs ({filteredInteractions.length} de {totalInteractions})
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar Lista
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Buscar usuário..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="sent">Enviadas</SelectItem>
                  <SelectItem value="delivered">Entregues</SelectItem>
                  <SelectItem value="read">Lidas</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-60">Usuário</TableHead>
                    <TableHead>Palavra-chave</TableHead>
                    <TableHead className="max-w-xs">Comentário</TableHead>
                    <TableHead>Status DM</TableHead>
                    <TableHead>Ações</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Perfil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInteractions.map((interaction) => (
                    <TableRow key={interaction.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                              {interaction.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">@{interaction.username}</p>
                            <p className="text-xs text-gray-500">{interaction.fullName}</p>
                            <p className="text-xs text-gray-400 flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {interaction.followers.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          #{interaction.keyword}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm truncate" title={interaction.comment}>
                          {interaction.comment}
                        </p>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(interaction.messageStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {interaction.clicked && (
                            <Badge className="bg-green-500 text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              Clicou
                            </Badge>
                          )}
                          {interaction.converted && (
                            <Badge className="bg-purple-500 text-xs">
                              <Target className="w-3 h-3 mr-1" />
                              Converteu
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p>{formatRelativeTime(interaction.commentTime)}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(interaction.commentTime)}
                          </p>
                        </div>
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

            {filteredInteractions.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma interação encontrada
                </h3>
                <p className="text-gray-500">
                  {searchUser || filterStatus !== 'all' 
                    ? "Tente ajustar os filtros para ver mais interações."
                    : "As interações dos usuários aparecerão aqui quando a campanha estiver ativa."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CampaignDetails;
