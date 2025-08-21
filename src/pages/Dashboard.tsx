
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Search, Calendar, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Check if user has connected Instagram account
  const { data: account } = useQuery({
    queryKey: ["connected-account"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  // Fetch posts with stats
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", searchTerm, dateFilter],
    queryFn: async () => {
      if (!account) return [];
      
      let query = supabase
        .from("posts")
        .select(`
          *,
          comments:comments(count),
          messages:messages(count)
        `)
        .eq("account_id", account.id)
        .order("posted_at", { ascending: false })
        .limit(50);

      if (searchTerm) {
        query = query.ilike("caption", `%${searchTerm}%`);
      }

      if (dateFilter) {
        query = query.gte("posted_at", dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(post => ({
        ...post,
        total_comments: post.comments?.[0]?.count || 0,
        total_messages: post.messages?.[0]?.count || 0,
        send_rate: post.comments?.[0]?.count > 0 
          ? ((post.messages?.[0]?.count || 0) / post.comments[0].count * 100).toFixed(1)
          : "0.0"
      }));
    },
    enabled: !!account,
  });

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
              Acompanhe suas campanhas de DM no Instagram
            </p>
          </div>
          <Link to="/new">
            <Button size="lg">Nova Campanha</Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
            <CardDescription>
              Filtre suas postagens por legenda ou data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar na legenda..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Grid */}
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
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Nenhuma postagem encontrada com os filtros aplicados.
            </p>
            <Link to="/new">
              <Button>Criar Nova Campanha</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
