import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  MoreVertical,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  MessageCircle,
  Send,
  TrendingUp,
  Zap,
  Filter,
  Calendar,
  Hash,
  Instagram,
  BarChart3,
  Users,
  Activity
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { getMVPAutomations, updateMVPAutomation, deleteMVPAutomation } from "@/lib/mvp";

interface Campaign {
  id: string;
  name: string | null;
  media_id?: string;
  caption: string | null;
  thumbnail_url: string | null;
  active_bool: boolean;
  created_at: string;
  posted_at: string | null;
  dm_template: string | null;
  total_comments?: number;
  total_messages?: number;
  send_rate?: string;
  keywords?: string[];
  account_name?: string;
}

const Campaigns = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editName, setEditName] = useState("");
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isInMVPMode } = useAuth();

  // Get user account for normal mode
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

  // Fetch campaigns/posts
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns", searchTerm, statusFilter, dateFilter],
    queryFn: async () => {
      if (isInMVPMode) {
        let mvpCampaigns = getMVPAutomations().map(automation => ({
          id: automation.id,
          name: automation.name,
          caption: automation.name,
          thumbnail_url: null,
          active_bool: true,
          created_at: automation.createdAt,
          posted_at: automation.createdAt,
          dm_template: automation.dmTemplate,
          total_comments: Math.floor(Math.random() * 50),
          total_messages: Math.floor(Math.random() * 30),
          send_rate: (Math.random() * 100).toFixed(1),
          keywords: automation.keywords,
          account_name: automation.accountName,
        }));
        
        // Apply filters
        if (searchTerm) {
          mvpCampaigns = mvpCampaigns.filter(campaign =>
            campaign.name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (statusFilter !== "all") {
          mvpCampaigns = mvpCampaigns.filter(campaign =>
            statusFilter === "active" ? campaign.active_bool : !campaign.active_bool
          );
        }
        
        if (dateFilter) {
          mvpCampaigns = mvpCampaigns.filter(campaign =>
            campaign.created_at >= dateFilter
          );
        }
        
        return mvpCampaigns;
      }

      if (!account) return [];
      
      let query = supabase
        .from("posts")
        .select(`
          *,
          comments:comments(count),
          messages:messages(count),
          keywords:keywords(word)
        `)
        .eq("account_id", account.id)
        .order("created_at", { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("active_bool", statusFilter === "active");
      }

      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(post => ({
        ...post,
        total_comments: post.comments?.[0]?.count || 0,
        total_messages: post.messages?.[0]?.count || 0,
        send_rate: post.comments?.[0]?.count > 0 
          ? ((post.messages?.[0]?.count || 0) / post.comments[0].count * 100).toFixed(1)
          : "0.0",
        keywords: post.keywords?.map(k => k.word) || [],
      }));
    },
    enabled: isInMVPMode || !!account,
  });

  // Toggle campaign status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ campaignId, newStatus }: { campaignId: string; newStatus: boolean }) => {
      if (isInMVPMode) {
        updateMVPAutomation(campaignId, { active: newStatus });
        return { success: true };
      }

      const { error } = await supabase
        .from("posts")
        .update({ active_bool: newStatus })
        .eq("id", campaignId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "✅ Status atualizado",
        description: "O status da campanha foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da campanha.",
        variant: "destructive",
      });
    },
  });

  // Edit campaign name mutation
  const editNameMutation = useMutation({
    mutationFn: async ({ campaignId, newName }: { campaignId: string; newName: string }) => {
      if (isInMVPMode) {
        updateMVPAutomation(campaignId, { name: newName });
        return { success: true };
      }

      const { error } = await supabase
        .from("posts")
        .update({ name: newName })
        .eq("id", campaignId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "✅ Nome atualizado",
        description: "O nome da campanha foi atualizado com sucesso.",
      });
      setEditingCampaign(null);
      setEditName("");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar nome da campanha.",
        variant: "destructive",
      });
    },
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      if (isInMVPMode) {
        deleteMVPAutomation(campaignId);
        return { success: true };
      }

      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", campaignId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "✅ Campanha excluída",
        description: "A campanha foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir campanha.",
        variant: "destructive",
      });
    },
  });

  const handleToggleStatus = (campaignId: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ campaignId, newStatus: !currentStatus });
  };

  const handleEditName = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setEditName(campaign.name || "");
  };

  const handleSaveEdit = () => {
    if (editingCampaign && editName.trim()) {
      editNameMutation.mutate({ campaignId: editingCampaign.id, newName: editName.trim() });
    }
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (confirm("Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.")) {
      deleteCampaignMutation.mutate(campaignId);
    }
  };

  const handleViewAnalytics = (campaign: Campaign) => {
    const url = isInMVPMode ? `/automations/${campaign.id}` : `/posts/${campaign.media_id}`;
    navigate(url);
  };

  // Calculate summary statistics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.active_bool).length;
  const totalComments = campaigns.reduce((sum, c) => sum + (c.total_comments || 0), 0);
  const totalMessages = campaigns.reduce((sum, c) => sum + (c.total_messages || 0), 0);
  const avgSendRate = totalCampaigns > 0 
    ? (campaigns.reduce((sum, c) => sum + parseFloat(c.send_rate || "0"), 0) / totalCampaigns).toFixed(1)
    : "0.0";

  // Filter counts for tabs
  const activeCampaignsCount = campaigns.filter(c => c.active_bool).length;
  const pausedCampaignsCount = campaigns.filter(c => !c.active_bool).length;

  if (!isInMVPMode && !account) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Instagram className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Conecte seu Instagram
          </h2>
          <p className="text-gray-600 mb-6">
            Conecte sua conta do Instagram Business para ver suas campanhas.
          </p>
          <Link to="/connect-instagram">
            <Button size="lg">
              Conectar Instagram
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Campanhas</h1>
              {isInMVPMode && (
                <Badge variant="secondary">
                  <Zap className="w-3 h-3 mr-1" />
                  Modo MVP
                </Badge>
              )}
            </div>
            <p className="text-gray-600">
              Gerencie todas as suas campanhas de automação de DM
            </p>
          </div>
          <Link to="/new">
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Nova Campanha
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{totalCampaigns}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{activeCampaigns}</p>
                  <p className="text-sm text-gray-600">Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{totalComments}</p>
                  <p className="text-sm text-gray-600">Comentários</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{avgSendRate}%</p>
                  <p className="text-sm text-gray-600">Taxa Média</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar por nome</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite o nome da campanha..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Tabs value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">Todas</TabsTrigger>
                    <TabsTrigger value="active">Ativas</TabsTrigger>
                    <TabsTrigger value="paused">Pausadas</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data de criação</Label>
                <Input
                  id="date"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Lista de Campanhas ({campaigns.length})
              </CardTitle>
              {campaigns.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {activeCampaignsCount} ativas
                  </Badge>
                  <Badge variant="secondary">
                    {pausedCampaignsCount} pausadas
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {searchTerm || statusFilter !== "all" || dateFilter
                    ? "Nenhuma campanha encontrada"
                    : "Nenhuma campanha criada"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== "all" || dateFilter
                    ? "Tente ajustar os filtros para ver mais campanhas."
                    : "Crie sua primeira campanha para começar a automatizar DMs."}
                </p>
                <Link to="/new">
                  <Button size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Campanha
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {campaign.thumbnail_url ? (
                            <img
                              src={campaign.thumbnail_url}
                              alt="Thumbnail"
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <Instagram className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {campaign.name || "Campanha sem nome"}
                            </h3>
                            <Badge variant={campaign.active_bool ? "default" : "secondary"}>
                              {campaign.active_bool ? "Ativa" : "Pausada"}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(campaign.created_at).toLocaleDateString("pt-BR")}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <Hash className="w-4 h-4" />
                              <span>
                                {campaign.keywords?.length || 0} palavras-chave
                              </span>
                            </div>

                            {isInMVPMode && (
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{campaign.account_name}</span>
                              </div>
                            )}
                          </div>

                          {!isInMVPMode && (
                            <div className="flex items-center space-x-6 mt-2">
                              <div className="flex items-center space-x-1 text-blue-600">
                                <MessageCircle className="w-4 h-4" />
                                <span className="font-medium">{campaign.total_comments}</span>
                                <span className="text-xs text-gray-500">comentários</span>
                              </div>

                              <div className="flex items-center space-x-1 text-green-600">
                                <Send className="w-4 h-4" />
                                <span className="font-medium">{campaign.total_messages}</span>
                                <span className="text-xs text-gray-500">DMs</span>
                              </div>

                              <div className="flex items-center space-x-1 text-purple-600">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-medium">{campaign.send_rate}%</span>
                                <span className="text-xs text-gray-500">taxa</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleViewAnalytics(campaign)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Analytics
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditName(campaign)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar Nome
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(campaign.id, campaign.active_bool)}
                            >
                              {campaign.active_bool ? (
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
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Name Dialog */}
        <Dialog open={!!editingCampaign} onOpenChange={() => setEditingCampaign(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Nome da Campanha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Novo nome</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Digite o novo nome da campanha"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingCampaign(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} disabled={!editName.trim()}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Campaigns;
