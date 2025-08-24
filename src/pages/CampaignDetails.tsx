import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  MessageCircle, 
  Send, 
  TrendingUp, 
  Users, 
  Eye,
  Clock,
  Share,
  Heart,
  Zap,
  ArrowLeft,
  Play,
  Pause,
  Download,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
  X,
  Save,
  Cancel,
  Image,
  Video,
  LinkIcon,
  MousePointer,
  Hash,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { getMVPAutomations, type MVPAutomation } from "@/lib/mvp";

// Simulated user interactions data
const generateUserInteractions = (campaignId: string) => {
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
  const statuses = ['sent', 'delivered', 'read', 'error'];

  return Array.from({ length: 15 }, (_, i) => {
    const user = users[Math.floor(Math.random() * users.length)];
    return {
      id: `interaction_${i}`,
      username: user.username,
      fullName: user.fullName,
      followers: user.followers,
      profileUrl: `https://instagram.com/${user.username}`,
      keyword: keywords[Math.floor(Math.random() * keywords.length)],
      comment: `Estou ${keywords[Math.floor(Math.random() * keywords.length)]} neste produto!`,
      commentTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      messageStatus: statuses[Math.floor(Math.random() * statuses.length)],
      dmSentTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      clicked: Math.random() > 0.7,
      converted: Math.random() > 0.85
    };
  }).sort((a, b) => new Date(b.commentTime).getTime() - new Date(a.commentTime).getTime());
};

const CampaignDetails = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<MVPAutomation | null>(null);
  const [userInteractions, setUserInteractions] = useState<any[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editingMessage, setEditingMessage] = useState(false);
  const [newName, setNewName] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [editedMessage, setEditedMessage] = useState('');
  const [editedMessageType, setEditedMessageType] = useState<'simple' | 'link' | 'button'>('simple');
  const [editedLinkUrl, setEditedLinkUrl] = useState('');
  const [editedButtons, setEditedButtons] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!campaignId) return;

    const campaigns = getMVPAutomations();
    const foundCampaign = campaigns.find(c => c.id === campaignId);
    
    if (foundCampaign) {
      setCampaign(foundCampaign);
      setNewName(foundCampaign.name);
      setEditedMessage(foundCampaign.dmTemplate);
      setEditedMessageType(foundCampaign.messageType || 'simple');
      setEditedLinkUrl(foundCampaign.linkUrl || '');
      setEditedButtons(foundCampaign.buttons || []);
      setUserInteractions(generateUserInteractions(campaignId));
    }
  }, [campaignId]);

  const handleSaveName = () => {
    if (newName.trim()) {
      // In a real app, this would update the campaign in the backend
      if (campaign) {
        setCampaign({ ...campaign, name: newName.trim() });
        setEditingName(false);
        toast({
          title: "Nome atualizado",
          description: "O nome da campanha foi alterado com sucesso.",
        });
      }
    }
  };

  const handleSaveMessage = () => {
    if (editedMessage.trim()) {
      // In a real app, this would update the campaign in the backend
      if (campaign) {
        setCampaign({ 
          ...campaign, 
          dmTemplate: editedMessage.trim(),
          messageType: editedMessageType,
          linkUrl: editedLinkUrl,
          buttons: editedButtons
        });
        setEditingMessage(false);
        toast({
          title: "Mensagem atualizada",
          description: "A mensagem da campanha foi alterada com sucesso.",
        });
      }
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && campaign) {
      const keyword = newKeyword.trim().toLowerCase();
      if (!campaign.keywords.includes(keyword)) {
        setCampaign({
          ...campaign,
          keywords: [...campaign.keywords, keyword]
        });
        setNewKeyword('');
        toast({
          title: "Palavra-chave adicionada",
          description: `A palavra-chave "${keyword}" foi adicionada.`,
        });
      }
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    if (campaign) {
      setCampaign({
        ...campaign,
        keywords: campaign.keywords.filter(k => k !== keyword)
      });
      toast({
        title: "Palavra-chave removida",
        description: `A palavra-chave "${keyword}" foi removida.`,
      });
    }
  };

  const handleToggleStatus = () => {
    setIsActive(!isActive);
    toast({
      title: isActive ? "Campanha pausada" : "Campanha ativada",
      description: isActive 
        ? "A campanha foi pausada e não enviará mais DMs."
        : "A campanha foi ativada e voltará a enviar DMs.",
    });
  };

  const addButton = () => {
    if (editedButtons.length < 2) {
      setEditedButtons([...editedButtons, { name: '', url: '', responseMessage: '' }]);
    }
  };

  const updateButton = (index: number, field: string, value: string) => {
    const newButtons = [...editedButtons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setEditedButtons(newButtons);
  };

  const removeButton = (index: number) => {
    setEditedButtons(editedButtons.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="secondary">Enviada</Badge>;
      case 'delivered':
        return <Badge variant="default">Entregue</Badge>;
      case 'read':
        return <Badge className="bg-green-500">Lida</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  if (!campaign) {
    return <Navigate to="/dashboard" replace />;
  }

  // Calculate metrics
  const totalInteractions = userInteractions.length;
  const totalSent = userInteractions.filter(u => u.messageStatus !== 'error').length;
  const totalClicks = userInteractions.filter(u => u.clicked).length;
  const totalConversions = userInteractions.filter(u => u.converted).length;
  const clickRate = totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : "0.0";
  const conversionRate = totalSent > 0 ? ((totalConversions / totalSent) * 100).toFixed(1) : "0.0";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <div className="flex items-center space-x-3">
                {editingName ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-2xl font-bold h-10"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                    />
                    <Button size="sm" onClick={handleSaveName}>
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingName(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold">{campaign.name}</h1>
                    <Button size="sm" variant="outline" onClick={() => setEditingName(true)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <Badge variant="secondary">
                  <Zap className="w-3 h-3 mr-1" />
                  Modo MVP
                </Badge>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "Ativa" : "Pausada"}
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">
                Campanha criada em {formatDate(campaign.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button
              onClick={handleToggleStatus}
              variant={isActive ? "destructive" : "default"}
            >
              {isActive ? (
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Interações</p>
                  <p className="text-2xl font-bold">{totalInteractions}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">DMs Enviadas</p>
                  <p className="text-2xl font-bold">{totalSent}</p>
                </div>
                <Send className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cliques</p>
                  <p className="text-2xl font-bold">{totalClicks}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa de Clique</p>
                  <p className="text-2xl font-bold">{clickRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversões</p>
                  <p className="text-2xl font-bold">{conversionRate}%</p>
                </div>
                <Users className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Being Monitored */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Publicações Monitoradas
              <Badge variant="secondary">{campaign.selectedPosts?.length || 1} publicação(ões)</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded flex items-center justify-center">
                  <Image className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Post Principal</p>
                  <p className="text-sm text-gray-500 break-all">{campaign.postUrl}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>📊 {totalInteractions} interações</span>
                    <span>💬 {totalSent} DMs enviadas</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href={campaign.postUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keywords Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Palavras-chave Monitoradas
              <Badge variant="secondary">{campaign.keywords.length} palavra(s)</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Nova palavra-chave..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                />
                <Button onClick={handleAddKeyword} disabled={!newKeyword.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {campaign.keywords.map(keyword => (
                  <div key={keyword} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    <Hash className="w-3 h-3 mr-1 text-gray-500" />
                    <span className="text-sm">{keyword}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-auto p-0 ml-2"
                      onClick={() => handleRemoveKeyword(keyword)}
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Configuração da Mensagem
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setEditingMessage(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Tipo de Mensagem</Label>
                <div className="flex items-center space-x-2 mt-1">
                  {campaign.messageType === 'simple' && <MessageCircle className="w-4 h-4 text-blue-500" />}
                  {campaign.messageType === 'link' && <LinkIcon className="w-4 h-4 text-blue-500" />}
                  {campaign.messageType === 'button' && <MousePointer className="w-4 h-4 text-blue-500" />}
                  <span className="text-sm capitalize">
                    {campaign.messageType === 'simple' && 'Mensagem Simples'}
                    {campaign.messageType === 'link' && 'Mensagem com Link'}
                    {campaign.messageType === 'button' && 'Mensagem com Botão'}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Conteúdo</Label>
                <div className="p-3 bg-gray-50 rounded text-sm mt-1">
                  {campaign.dmTemplate}
                </div>
              </div>

              {campaign.messageType === 'link' && campaign.linkUrl && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Link</Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm mt-1">
                    <a href={campaign.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all">
                      {campaign.linkUrl}
                    </a>
                  </div>
                </div>
              )}

              {campaign.messageType === 'button' && campaign.buttons && campaign.buttons.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Botões ({campaign.buttons.length})</Label>
                  <div className="space-y-2 mt-1">
                    {campaign.buttons.map((button: any, index: number) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded">
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Nome:</span> {button.name}</p>
                          <p><span className="font-medium">Link:</span> <a href={button.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all">{button.url}</a></p>
                          <p><span className="font-medium">Resposta:</span> {button.responseMessage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Interactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Interações dos Usuários</CardTitle>
            <CardDescription>
              Usuários que comentaram e receberam DMs automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Palavra-chave</TableHead>
                    <TableHead>Comentário</TableHead>
                    <TableHead>Status DM</TableHead>
                    <TableHead>Clicou</TableHead>
                    <TableHead>Converteu</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userInteractions.map((interaction) => (
                    <TableRow key={interaction.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {interaction.fullName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">@{interaction.username}</p>
                            <p className="text-xs text-gray-500">{interaction.fullName}</p>
                            <p className="text-xs text-gray-400">{interaction.followers.toLocaleString()} seguidores</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          #{interaction.keyword}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm truncate">{interaction.comment}</p>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(interaction.messageStatus)}
                      </TableCell>
                      <TableCell>
                        {interaction.clicked ? (
                          <Badge className="bg-green-500 text-xs">Sim</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Não</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {interaction.converted ? (
                          <Badge className="bg-purple-500 text-xs">Sim</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Não</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTime(interaction.commentTime)}
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

        {/* Message Editing Dialog */}
        <Dialog open={editingMessage} onOpenChange={setEditingMessage}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Configuração da Mensagem</DialogTitle>
              <DialogDescription>
                Personalize todos os aspectos da mensagem automática
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Message Type Selection */}
              <div className="space-y-3">
                <Label>Tipo de Mensagem</Label>
                <Select value={editedMessageType} onValueChange={(value: any) => setEditedMessageType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Mensagem Simples</SelectItem>
                    <SelectItem value="link">Mensagem com Link</SelectItem>
                    <SelectItem value="button">Mensagem com Botão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <Label>Conteúdo da Mensagem</Label>
                <Textarea
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  rows={4}
                  placeholder="Oi {first_name}! Vi seu interesse no meu post..."
                />
              </div>

              {/* Link Configuration */}
              {editedMessageType === 'link' && (
                <div className="space-y-2">
                  <Label>URL do Link</Label>
                  <Input
                    type="url"
                    value={editedLinkUrl}
                    onChange={(e) => setEditedLinkUrl(e.target.value)}
                    placeholder="https://meusite.com/oferta"
                  />
                </div>
              )}

              {/* Button Configuration */}
              {editedMessageType === 'button' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Botões (máx. 2)</Label>
                    <Button 
                      size="sm" 
                      onClick={addButton} 
                      disabled={editedButtons.length >= 2}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Botão
                    </Button>
                  </div>
                  
                  {editedButtons.map((button, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Botão {index + 1}</Label>
                        <Button size="sm" variant="destructive" onClick={() => removeButton(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Nome do Botão</Label>
                          <Input
                            value={button.name}
                            onChange={(e) => updateButton(index, 'name', e.target.value)}
                            placeholder="Ex: Ver Oferta"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">URL do Botão</Label>
                          <Input
                            type="url"
                            value={button.url}
                            onChange={(e) => updateButton(index, 'url', e.target.value)}
                            placeholder="https://exemplo.com"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm">Mensagem de Resposta</Label>
                        <Textarea
                          value={button.responseMessage}
                          onChange={(e) => updateButton(index, 'responseMessage', e.target.value)}
                          placeholder="Obrigado pelo interesse! Aqui está mais informações..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingMessage(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveMessage}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CampaignDetails;
