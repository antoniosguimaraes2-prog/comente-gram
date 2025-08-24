import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Instagram,
  Save,
  Edit,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Key,
  Zap
} from "lucide-react";

const Account = () => {
  const { user, isInMVPMode } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editing, setEditing] = useState({
    profile: false,
    password: false
  });
  
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [notifications, setNotifications] = useState({
    emailMarketing: true,
    emailUpdates: true,
    emailSecurity: true,
    pushNotifications: false
  });

  // Get connected Instagram account
  const { data: instagramAccount } = useQuery({
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
    enabled: !isInMVPMode,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: data.name }
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "✅ Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      setEditing(prev => ({ ...prev, profile: false }));
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar perfil.",
        variant: "destructive",
      });
    }
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "✅ Senha alterada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      setEditing(prev => ({ ...prev, password: false }));
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar senha.",
        variant: "destructive",
      });
    }
  });

  const handleSaveProfile = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate({ name: formData.name.trim() });
  };

  const handleSavePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    updatePasswordMutation.mutate({ password: formData.newPassword });
  };

  const handleExportData = () => {
    // Simulate data export
    toast({
      title: "📦 Exportação iniciada",
      description: "Seus dados serão enviados por email em breve.",
    });
  };

  const handleDeleteAccount = () => {
    if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão perdidos permanentemente.')) {
      toast({
        title: "🗑️ Exclusão solicitada",
        description: "Sua solicitação foi registrada. Entraremos em contato em até 24h para confirmar.",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">Configurações da Conta</h1>
            {isInMVPMode && (
              <Badge variant="secondary">
                <Zap className="w-3 h-3 mr-1" />
                Modo MVP
              </Badge>
            )}
          </div>
          <p className="text-gray-600">
            Gerencie suas informações pessoais, segurança e preferências
          </p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Informações do Perfil</span>
                </CardTitle>
                <CardDescription>
                  Suas informações básicas da conta
                </CardDescription>
              </div>
              {!editing.profile && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditing(prev => ({ ...prev, profile: true }))}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                {editing.profile ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <p className="py-2 text-gray-900">{formData.name || "Não informado"}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="py-2 text-gray-900">{formData.email}</p>
                </div>
                <p className="text-xs text-gray-500">
                  Para alterar o email, entre em contato com o suporte
                </p>
              </div>
            </div>

            {editing.profile && (
              <div className="flex space-x-2 pt-4 border-t">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setEditing(prev => ({ ...prev, profile: false }));
                    setFormData(prev => ({ ...prev, name: user?.user_metadata?.full_name || "" }));
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instagram Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Instagram className="w-5 h-5" />
              <span>Conta Instagram</span>
            </CardTitle>
            <CardDescription>
              Sua conexão com o Instagram Business
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isInMVPMode ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Modo MVP Ativo</p>
                    <p className="text-sm text-blue-700">Testando funcionalidades sem Instagram real</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                  Simulação
                </Badge>
              </div>
            ) : instagramAccount ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Instagram className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Conta Conectada</p>
                    <p className="text-sm text-green-700">ID: {instagramAccount.ig_business_id}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Ativo
                </Badge>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Instagram className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900">Não Conectado</p>
                    <p className="text-sm text-orange-700">Configure sua conta Instagram Business</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/connect-instagram">Conectar</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        {!isInMVPMode && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Segurança</span>
                  </CardTitle>
                  <CardDescription>
                    Gerencie sua senha e configurações de segurança
                  </CardDescription>
                </div>
                {!editing.password && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditing(prev => ({ ...prev, password: true }))}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing.password ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Digite sua senha atual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Digite sua nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirme sua nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t">
                    <Button 
                      onClick={handleSavePassword}
                      disabled={updatePasswordMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Nova Senha
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setEditing(prev => ({ ...prev, password: false }));
                        setFormData(prev => ({
                          ...prev,
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: ""
                        }));
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Senha</p>
                      <p className="text-sm text-gray-500">Última alteração há 30 dias</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notificações</span>
            </CardTitle>
            <CardDescription>
              Configure como e quando deseja receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Emails de Marketing</p>
                  <p className="text-sm text-gray-500">Novidades, promoções e dicas</p>
                </div>
                <Switch
                  checked={notifications.emailMarketing}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailMarketing: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Atualizações do Produto</p>
                  <p className="text-sm text-gray-500">Novos recursos e melhorias</p>
                </div>
                <Switch
                  checked={notifications.emailUpdates}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailUpdates: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertas de Segurança</p>
                  <p className="text-sm text-gray-500">Tentativas de login e mudanças importantes</p>
                </div>
                <Switch
                  checked={notifications.emailSecurity}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailSecurity: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações Push</p>
                  <p className="text-sm text-gray-500">Alertas em tempo real no navegador</p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Dados</CardTitle>
            <CardDescription>
              Exporte ou exclua seus dados da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Exportar Dados</p>
                <p className="text-sm text-gray-500">Baixe uma cópia de todos os seus dados</p>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <p className="font-medium text-red-900">Excluir Conta</p>
                <p className="text-sm text-red-700">Remove permanentemente sua conta e todos os dados</p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Account;
