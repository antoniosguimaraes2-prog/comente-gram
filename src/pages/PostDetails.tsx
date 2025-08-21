
import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  MessageCircle, 
  Send, 
  TrendingUp, 
  Play, 
  Pause, 
  Plus, 
  Edit, 
  TestTube,
  Loader2
} from "lucide-react";

const PostDetails = () => {
  const { mediaId } = useParams<{ mediaId: string }>();
  const [newKeywords, setNewKeywords] = useState("");
  const [dmTemplate, setDmTemplate] = useState("");
  const [showAddKeywords, setShowAddKeywords] = useState(false);
  const [showEditTemplate, setShowEditTemplate] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch post details
  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post-details", mediaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          keywords(*),
          comments(*, keywords(word)),
          messages(*, keywords(word))
        `)
        .eq("media_id", mediaId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!mediaId,
  });

  // Toggle campaign active status
  const toggleCampaignMutation = useMutation({
    mutationFn: async (active: boolean) => {
      const { error } = await supabase
        .from("posts")
        .update({ active_bool: active })
        .eq("id", post?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: post?.active_bool ? "Campanha pausada" : "Campanha ativada",
        description: post?.active_bool 
          ? "A campanha foi pausada e não enviará mais DMs."
          : "A campanha foi ativada e voltará a enviar DMs.",
      });
      queryClient.invalidateQueries({ queryKey: ["post-details", mediaId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar status da campanha.",
        variant: "destructive",
      });
    },
  });

  // Add keywords mutation
  const addKeywordsMutation = useMutation({
    mutationFn: async (keywords: string[]) => {
      const keywordInserts = keywords.map(word => ({
        post_id: post?.id,
        word: word.toLowerCase().trim(),
        active_bool: true,
      }));

      const { error } = await supabase
        .from("keywords")
        .insert(keywordInserts);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Palavras-chave adicionadas",
        description: "As novas palavras-chave foram adicionadas com sucesso.",
      });
      setNewKeywords("");
      setShowAddKeywords(false);
      queryClient.invalidateQueries({ queryKey: ["post-details", mediaId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar palavras-chave.",
        variant: "destructive",
      });
    },
  });

  // Update DM template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async (template: string) => {
      const { error } = await supabase
        .from("posts")
        .update({ dm_template: template })
        .eq("id", post?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Mensagem atualizada",
        description: "O template de DM foi atualizado com sucesso.",
      });
      setShowEditTemplate(false);
      queryClient.invalidateQueries({ queryKey: ["post-details", mediaId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar template.",
        variant: "destructive",
      });
    },
  });

  const handleAddKeywords = () => {
    if (!newKeywords.trim()) {
      toast({
        title: "Erro",
        description: "Digite pelo menos uma palavra-chave.",
        variant: "destructive",
      });
      return;
    }

    const keywords = newKeywords
      .split(",")
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);

    if (keywords.length === 0) {
      toast({
        title: "Erro",
        description: "Digite palavras-chave válidas.",
        variant: "destructive",
      });
      return;
    }

    addKeywordsMutation.mutate(keywords);
  };

  const handleUpdateTemplate = () => {
    if (!dmTemplate.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem válida.",
        variant: "destructive",
      });
      return;
    }

    updateTemplateMutation.mutate(dmTemplate.trim());
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("pt-BR");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return <Navigate to="/dashboard" replace />;
  }

  // Calculate stats
  const totalComments = post.comments?.length || 0;
  const totalMessages = post.messages?.length || 0;
  const sendRate = totalComments > 0 ? ((totalMessages / totalComments) * 100).toFixed(1) : "0.0";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
              {post.thumbnail_url ? (
                <img
                  src={post.thumbnail_url}
                  alt="Post thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <MessageCircle className="w-8 h-8" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold">Detalhes da Postagem</h1>
                <Badge variant={post.active_bool ? "default" : "secondary"}>
                  {post.active_bool ? "Ativa" : "Pausada"}
                </Badge>
              </div>
              
              <Button
                onClick={() => toggleCampaignMutation.mutate(!post.active_bool)}
                disabled={toggleCampaignMutation.isPending}
                variant={post.active_bool ? "destructive" : "default"}
              >
                {toggleCampaignMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {post.active_bool ? (
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

            <p className="text-gray-700">
              {post.caption || "Sem legenda"}
            </p>

            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(post.posted_at)}
              </div>
              <div>Media ID: {post.media_id}</div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center text-blue-600 mb-1">
                  <MessageCircle className="w-5 h-5 mr-1" />
                  <span className="text-2xl font-bold">{totalComments}</span>
                </div>
                <p className="text-sm text-gray-600">Comentários</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center text-green-600 mb-1">
                  <Send className="w-5 h-5 mr-1" />
                  <span className="text-2xl font-bold">{totalMessages}</span>
                </div>
                <p className="text-sm text-gray-600">DMs Enviadas</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center text-purple-600 mb-1">
                  <TrendingUp className="w-5 h-5 mr-1" />
                  <span className="text-2xl font-bold">{sendRate}%</span>
                </div>
                <p className="text-sm text-gray-600">Taxa de Envio</p>
              </div>
            </div>
          </div>
        </div>

        {/* DM Template */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mensagem de DM</CardTitle>
              <Dialog open={showEditTemplate} onOpenChange={setShowEditTemplate}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setDmTemplate(post.dm_template || "")}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Mensagem de DM</DialogTitle>
                    <DialogDescription>
                      Personalize a mensagem que será enviada automaticamente. Use {"{first_name}"} e {"{link}"} como placeholders.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="template">Mensagem</Label>
                      <Textarea
                        id="template"
                        value={dmTemplate}
                        onChange={(e) => setDmTemplate(e.target.value)}
                        rows={4}
                        placeholder="Oi {first_name}! Vi seu interesse no meu post..."
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowEditTemplate(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleUpdateTemplate}
                        disabled={updateTemplateMutation.isPending}
                      >
                        {updateTemplateMutation.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Salvar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-mono">
                {post.dm_template || "Nenhuma mensagem configurada"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Keywords Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Palavras-Chave</CardTitle>
              <Dialog open={showAddKeywords} onOpenChange={setShowAddKeywords}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Palavras
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Palavras-Chave</DialogTitle>
                    <DialogDescription>
                      Digite as palavras-chave separadas por vírgulas
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="keywords">Palavras-chave</Label>
                      <Input
                        id="keywords"
                        value={newKeywords}
                        onChange={(e) => setNewKeywords(e.target.value)}
                        placeholder="preço, valor, quanto custa"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddKeywords(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleAddKeywords}
                        disabled={addKeywordsMutation.isPending}
                      >
                        {addKeywordsMutation.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {post.keywords && post.keywords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Palavra</TableHead>
                    <TableHead>Comentários</TableHead>
                    <TableHead>DMs Enviadas</TableHead>
                    <TableHead>Último Disparo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {post.keywords.map((keyword: any) => {
                    const keywordComments = post.comments?.filter((c: any) => c.matched_keyword_id === keyword.id) || [];
                    const keywordMessages = post.messages?.filter((m: any) => m.keyword_id === keyword.id) || [];
                    const lastMessage = keywordMessages.sort((a: any, b: any) => 
                      new Date(b.sent_at || b.created_at).getTime() - new Date(a.sent_at || a.created_at).getTime()
                    )[0];

                    return (
                      <TableRow key={keyword.id}>
                        <TableCell className="font-medium">{keyword.word}</TableCell>
                        <TableCell>{keywordComments.length}</TableCell>
                        <TableCell>{keywordMessages.length}</TableCell>
                        <TableCell>
                          {lastMessage ? formatDate(lastMessage.sent_at || lastMessage.created_at) : "Nunca"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={keyword.active_bool ? "default" : "secondary"}>
                            {keyword.active_bool ? "Ativa" : "Pausada"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Nenhuma palavra-chave configurada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens Enviadas</CardTitle>
            <CardDescription>
              Histórico de DMs enviadas para esta postagem
            </CardDescription>
          </CardHeader>
          <CardContent>
            {post.messages && post.messages.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Palavra Acionada</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Horário do Comentário</TableHead>
                      <TableHead>Horário do Envio</TableHead>
                      <TableHead>Erro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {post.messages
                      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((message: any) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          @{message.ig_username || `user_${message.ig_user_id.slice(-4)}`}
                        </TableCell>
                        <TableCell>
                          {message.keywords?.word || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            message.status === 'SENT' ? 'default' :
                            message.status === 'ERROR' ? 'destructive' : 'secondary'
                          }>
                            {message.status === 'SENT' ? 'Enviada' :
                             message.status === 'ERROR' ? 'Erro' : 'Tentando'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {/* Find related comment */}
                          {(() => {
                            const relatedComment = post.comments?.find((c: any) => 
                              c.ig_user_id === message.ig_user_id && 
                              c.matched_keyword_id === message.keyword_id
                            );
                            return relatedComment ? formatDate(relatedComment.commented_at) : "N/A";
                          })()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(message.sent_at)}
                        </TableCell>
                        <TableCell className="text-sm text-red-600">
                          {message.error_text || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Nenhuma mensagem enviada ainda</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PostDetails;
