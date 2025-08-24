import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { getMVPAutomations, type MVPAutomation } from "@/lib/mvp";

// Simulated analytics data
const generateAnalyticsData = (campaignId: string) => {
  const seed = parseInt(campaignId) || Date.now();
  const random = (max: number, min: number = 0) => 
    Math.floor(Math.random() * (max - min + 1)) + min;

  const totalViews = random(1500, 500);
  const totalComments = random(150, 30);
  const totalMessages = random(120, 20);
  const clickRate = ((random(80, 20)) / 100).toFixed(1);
  const conversionRate = ((random(15, 3)) / 100).toFixed(1);

  // Generate hourly data for the last 24 hours
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${23 - i}h`,
    views: random(80, 10),
    comments: random(12, 1),
    messages: random(8, 0),
  }));

  // Generate messages log
  const messageTypes = ['Interessado', 'Preço', 'Info', 'Comprar', 'Dúvida'];
  const users = ['joao_silva', 'maria_santos', 'pedro_costa', 'ana_oliveira', 'carlos_lima'];
  
  const messagesLog = Array.from({ length: totalMessages }, (_, i) => ({
    id: `msg_${i}`,
    username: users[random(users.length - 1)],
    keyword: messageTypes[random(messageTypes.length - 1)].toLowerCase(),
    status: random(10) > 1 ? 'SENT' : 'ERROR',
    commentTime: new Date(Date.now() - random(86400000, 3600000)).toISOString(),
    sentTime: new Date(Date.now() - random(86400000, 3600000)).toISOString(),
    error: random(10) > 8 ? 'Rate limit exceeded' : null,
  }));

  const keywordStats = [
    { keyword: 'interessado', comments: random(40, 10), messages: random(35, 8), rate: random(95, 70) },
    { keyword: 'preço', comments: random(30, 8), messages: random(25, 6), rate: random(90, 65) },
    { keyword: 'info', comments: random(25, 5), messages: random(20, 4), rate: random(85, 60) },
    { keyword: 'comprar', comments: random(20, 3), messages: random(18, 3), rate: random(95, 80) },
    { keyword: 'dúvida', comments: random(15, 2), messages: random(12, 2), rate: random(80, 55) },
  ];

  return {
    totalViews,
    totalComments,
    totalMessages,
    clickRate: parseFloat(clickRate),
    conversionRate: parseFloat(conversionRate),
    sendRate: totalComments > 0 ? ((totalMessages / totalComments) * 100).toFixed(1) : "0.0",
    hourlyData,
    messagesLog,
    keywordStats: keywordStats.slice(0, random(5, 2)),
  };
};

const CampaignDetails = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<MVPAutomation | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isActive, setIsActive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    console.log('CampaignDetails mounted with campaignId:', campaignId);
    if (!campaignId) return;

    const campaigns = getMVPAutomations();
    const foundCampaign = campaigns.find(c => c.id === campaignId);
    
    if (foundCampaign) {
      setCampaign(foundCampaign);
      setAnalytics(generateAnalyticsData(campaignId));
    }
  }, [campaignId]);

  const handleToggleStatus = () => {
    setIsActive(!isActive);
    toast({
      title: isActive ? "Campanha pausada" : "Campanha ativada",
      description: isActive 
        ? "A campanha foi pausada e não enviará mais DMs."
        : "A campanha foi ativada e voltará a enviar DMs.",
    });
  };

  const handleRefreshData = () => {
    if (campaignId) {
      setAnalytics(generateAnalyticsData(campaignId));
      setLastUpdate(new Date());
      toast({
        title: "Dados atualizados",
        description: "Os analytics foram atualizados com novos dados simulados.",
      });
    }
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

  if (!campaign || !analytics) {
    return <Navigate to="/dashboard" replace />;
  }

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
                <h1 className="text-2xl font-bold">{campaign.name}</h1>
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
            <Button variant="outline" size="sm" onClick={handleRefreshData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
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
                  <p className="text-sm text-gray-600">Visualizações</p>
                  <p className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Comentários</p>
                  <p className="text-2xl font-bold">{analytics.totalComments}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">DMs Enviadas</p>
                  <p className="text-2xl font-bold">{analytics.totalMessages}</p>
                </div>
                <Send className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa de Envio</p>
                  <p className="text-2xl font-bold">{analytics.sendRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversão</p>
                  <p className="text-2xl font-bold">{analytics.conversionRate}%</p>
                </div>
                <Users className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral da Campanha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Conta</p>
                  <p className="text-sm">{campaign.accountName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Post URL</p>
                  <p className="text-sm break-all text-blue-600">{campaign.postUrl}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Palavras-chave</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {campaign.keywords.map(keyword => (
                      <Badge key={keyword} variant="secondary" className="text-xs">
                        #{keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Template de DM</p>
                  <div className="p-3 bg-gray-50 rounded text-sm mt-1">
                    {campaign.dmTemplate}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Última atualização</p>
                  <p className="text-sm text-gray-600">{lastUpdate.toLocaleString("pt-BR")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="keywords">Palavras-chave</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            {/* Performance Chart Mock */}
            <Card>
              <CardHeader>
                <CardTitle>Performance nas Últimas 24h</CardTitle>
                <CardDescription>
                  Visualizações, comentários e mensagens por hora
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.hourlyData.slice(0, 8).map((data: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 text-sm text-gray-500">{data.hour}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Visualizações: {data.views}</span>
                          <span>Comentários: {data.comments}</span>
                          <span>DMs: {data.messages}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <Progress value={(data.views / 100)} className="h-2" />
                          <Progress value={(data.comments / 15) * 100} className="h-2" />
                          <Progress value={(data.messages / 10) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Palavra-chave</CardTitle>
                <CardDescription>
                  Estatísticas detalhadas de cada palavra-chave monitorada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Palavra-chave</TableHead>
                      <TableHead>Comentários</TableHead>
                      <TableHead>DMs Enviadas</TableHead>
                      <TableHead>Taxa de Sucesso</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.keywordStats.map((stat: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">#{stat.keyword}</TableCell>
                        <TableCell>{stat.comments}</TableCell>
                        <TableCell>{stat.messages}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={stat.rate} className="w-20 h-2" />
                            <span className="text-sm">{stat.rate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Ativa</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Log de Mensagens</CardTitle>
                <CardDescription>
                  Histórico detalhado de todas as DMs enviadas
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
                        <TableHead>Comentário</TableHead>
                        <TableHead>Envio</TableHead>
                        <TableHead>Erro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.messagesLog.slice(0, 20).map((message: any) => (
                        <TableRow key={message.id}>
                          <TableCell>@{message.username}</TableCell>
                          <TableCell>#{message.keyword}</TableCell>
                          <TableCell>
                            <Badge variant={message.status === 'SENT' ? 'default' : 'destructive'}>
                              {message.status === 'SENT' ? 'Enviada' : 'Erro'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatTime(message.commentTime)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatTime(message.sentTime)}
                          </TableCell>
                          <TableCell className="text-sm text-red-600">
                            {message.error || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Timeline de Atividades</CardTitle>
                <CardDescription>
                  Cronologia das principais atividades da campanha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.messagesLog.slice(0, 10).map((message: any, index: number) => (
                    <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Send className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">DM enviada</span> para 
                          <span className="font-medium text-blue-600"> @{message.username}</span>
                          {message.keyword && (
                            <span> pela palavra-chave <Badge variant="secondary" className="text-xs ml-1">#{message.keyword}</Badge></span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(message.sentTime)}
                        </p>
                      </div>
                      <Badge variant={message.status === 'SENT' ? 'default' : 'destructive'} className="text-xs">
                        {message.status === 'SENT' ? 'Sucesso' : 'Erro'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CampaignDetails;
