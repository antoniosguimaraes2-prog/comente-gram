
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { getMVPInsights } from "@/lib/mvp";
import { BarChart3, MessageSquare, Send, Zap } from "lucide-react";

const DashboardInsights = () => {
  const { isInMVPMode } = useAuth();

  // Fetch insights data
  const { data: insights } = useQuery({
    queryKey: ["dashboard-insights"],
    queryFn: async () => {
      if (isInMVPMode) {
        return getMVPInsights();
      }

      // Get total automations (posts)
      const { count: totalAutomations } = await supabase
        .from("posts")
        .select("*", { count: 'exact', head: true });

      // Get total comments
      const { count: totalComments } = await supabase
        .from("comments")
        .select("*", { count: 'exact', head: true });

      // Get total messages sent
      const { count: totalMessages } = await supabase
        .from("messages")
        .select("*", { count: 'exact', head: true });

      return {
        totalAutomations: totalAutomations || 0,
        totalComments: totalComments || 0,
        totalMessages: totalMessages || 0,
      };
    },
  });

  const insightCards = [
    {
      title: "Automações Ativas",
      value: insights?.totalAutomations || 0,
      icon: <Zap className="w-4 h-4" />,
      color: "text-blue-600",
    },
    {
      title: "Comentários Detectados",
      value: insights?.totalComments || 0,
      icon: <MessageSquare className="w-4 h-4" />,
      color: "text-green-600",
    },
    {
      title: "DMs Enviadas",
      value: insights?.totalMessages || 0,
      icon: <Send className="w-4 h-4" />,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {insightCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={card.color}>
              {card.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardInsights;
