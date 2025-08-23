
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import DashboardInsights from "@/components/DashboardInsights";
import DashboardFilters from "@/components/DashboardFilters";
import AutomationCard from "@/components/AutomationCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { getMVPAutomations } from "@/lib/mvp";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const { isInMVPMode } = useAuth();

  // Check if user has connected Instagram account (skip in MVP mode)
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

  // Get available accounts for filter (in normal mode)
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      if (isInMVPMode) return [];
      
      const { data, error } = await supabase
        .from("accounts")
        .select("id, page_id");
      
      if (error) throw error;
      return data.map(acc => ({
        id: acc.id,
        name: `Conta ${acc.page_id}`, // You can enhance this with actual account names
      }));
    },
    enabled: !isInMVPMode,
  });

  // Fetch posts/automations with filtering
  const { data: automations = [], isLoading } = useQuery({
    queryKey: ["automations", searchTerm, dateFilter, accountFilter],
    queryFn: async () => {
      if (isInMVPMode) {
        let mvpAutomations = getMVPAutomations();
        
        // Apply filters
        if (searchTerm) {
          mvpAutomations = mvpAutomations.filter(auto =>
            auto.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (dateFilter) {
          mvpAutomations = mvpAutomations.filter(auto =>
            auto.createdAt >= dateFilter
          );
        }
        
        return mvpAutomations;
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
        .order("created_at", { ascending: false })
        .limit(50);

      // Apply account filter
      if (accountFilter !== "all") {
        query = query.eq("account_id", accountFilter);
      }

      // Apply name search filter
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      // Apply date filter
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
        dmTemplate: post.dm_template,
      }));
    },
    enabled: isInMVPMode || !!account,
  });

  // MVP Mode - show local automations
  if (isInMVPMode) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <Badge variant="secondary">
                  <Zap className="w-3 h-3 mr-1" />
                  Modo MVP
                </Badge>
              </div>
              <p className="text-gray-600">
                Teste suas automações localmente (dados salvos no navegador)
              </p>
            </div>
            <Link to="/new">
              <Button size="lg">Nova Automação de Teste</Button>
            </Link>
          </div>

          <DashboardInsights />

          <DashboardFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            accountFilter={accountFilter}
            onAccountChange={setAccountFilter}
            accounts={[]}
            isInMVPMode={true}
          />

          {automations.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {searchTerm || dateFilter ? "Nenhuma automação encontrada" : "Crie sua primeira automação de teste"}
              </h2>
              <p className="text-gray-600 mb-6">
                {searchTerm || dateFilter
                  ? "Tente ajustar os filtros para ver mais automações."
                  : "No modo MVP você pode testar o fluxo completo sem conectar Instagram."}
              </p>
              <Link to="/new">
                <Button size="lg">Criar Automação de Teste</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {automations.map((automation) => (
                <AutomationCard key={automation.id} automation={automation} />
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // Regular mode - check Instagram connection
  if (!account) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Instagram className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Conecte seu Instagram
          </h2>
          <p className="text-gray-600 mb-6">
            Conecte sua conta do Instagram Business para começar a automatizar DMs.
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Acompanhe suas automações de DM no Instagram
            </p>
          </div>
          <Link to="/new">
            <Button size="lg">Nova Automação</Button>
          </Link>
        </div>

        <DashboardInsights />

        <DashboardFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          accountFilter={accountFilter}
          onAccountChange={setAccountFilter}
          accounts={accounts}
          isInMVPMode={false}
        />

        {/* Automations Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : automations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {searchTerm || dateFilter || accountFilter !== "all"
                ? "Nenhuma automação encontrada com os filtros aplicados."
                : "Você ainda não criou nenhuma automação."}
            </p>
            <Link to="/new">
              <Button>Criar Nova Automação</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automations.map((automation) => (
              <AutomationCard key={automation.id} automation={automation} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
