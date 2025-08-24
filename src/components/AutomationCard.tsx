import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Calendar, MessageCircle, Send, TrendingUp, Zap, Instagram } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

interface AutomationCardProps {
  automation: {
    id: string;
    name?: string;
    media_id?: string;
    caption?: string | null;
    thumbnail_url?: string | null;
    posted_at?: string | null;
    active_bool?: boolean;
    total_comments?: number;
    total_messages?: number;
    send_rate?: string;
    keywords?: string[];
    dmTemplate?: string;
    createdAt?: string;
    accountName?: string;
    postUrl?: string;
  };
}

const AutomationCard = ({ automation }: AutomationCardProps) => {
  const { isInMVPMode } = useAuth();
  const navigate = useNavigate();

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Data não disponível";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const truncateText = (text: string | null | undefined, maxLength: number = 120) => {
    if (!text) return "Não informado";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const displayName = automation.name || "Automação sem nome";
  const displayDate = isInMVPMode ? automation.createdAt : automation.posted_at;
  const displayAccount = isInMVPMode ? automation.accountName : "Conta conectada";
  const displayKeywords = automation.keywords?.join(", ") || "Nenhuma palavra-chave";
  const displayMessage = truncateText(automation.dmTemplate || automation.caption);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isInMVPMode ? (
              <Zap className="w-4 h-4 text-blue-500" />
            ) : (
              <Instagram className="w-4 h-4 text-pink-500" />
            )}
            <h3 className="font-semibold text-gray-900">{displayName}</h3>
          </div>
          <Badge variant={automation.active_bool !== false ? "default" : "secondary"}>
            {automation.active_bool !== false ? "Ativa" : "Pausada"}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Instagram className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600">Conta: {displayAccount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600">Criado: {formatDate(displayDate)}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Palavras-chave:</p>
            <p className="text-sm text-gray-700">{displayKeywords}</p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Mensagem:</p>
            <p className="text-sm text-gray-700 line-clamp-2">{displayMessage}</p>
          </div>
        </div>

        {!isInMVPMode && (
          <div className="grid grid-cols-3 gap-4 text-center mt-4 pt-4 border-t">
            <div className="space-y-1">
              <div className="flex items-center justify-center text-blue-600">
                <MessageCircle className="w-4 h-4 mr-1" />
                <span className="font-semibold">{automation.total_comments || 0}</span>
              </div>
              <p className="text-xs text-gray-500">Comentários</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center text-green-600">
                <Send className="w-4 h-4 mr-1" />
                <span className="font-semibold">{automation.total_messages || 0}</span>
              </div>
              <p className="text-xs text-gray-500">DMs Enviadas</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center text-purple-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="font-semibold">{automation.send_rate || "0.0"}%</span>
              </div>
              <p className="text-xs text-gray-500">Taxa</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link to={isInMVPMode ? `/automations/${automation.id}` : `/posts/${automation.media_id}`} className="w-full">
          <Button className="w-full">Ver Analytics</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default AutomationCard;
