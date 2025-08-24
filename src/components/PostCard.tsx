import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Calendar, MessageCircle, Send, TrendingUp } from "lucide-react";

interface Post {
  id: string;
  media_id: string;
  caption: string | null;
  thumbnail_url: string | null;
  posted_at: string | null;
  active_bool: boolean;
  total_comments: number;
  total_messages: number;
  send_rate: string;
}

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Data não disponível";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const truncateCaption = (caption: string | null) => {
    if (!caption) return "Sem legenda";
    return caption.length > 120 ? caption.substring(0, 120) + "..." : caption;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="p-4">
        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-3">
          {post.thumbnail_url ? (
            <img
              src={post.thumbnail_url}
              alt="Post thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <MessageCircle className="w-12 h-12" />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mb-2">
          <Badge variant={post.active_bool ? "default" : "secondary"}>
            {post.active_bool ? "Ativa" : "Pausada"}
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(post.posted_at)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
          {truncateCaption(post.caption)}
        </p>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center text-blue-600">
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="font-semibold">{post.total_comments}</span>
            </div>
            <p className="text-xs text-gray-500">Comentários</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center text-green-600">
              <Send className="w-4 h-4 mr-1" />
              <span className="font-semibold">{post.total_messages}</span>
            </div>
            <p className="text-xs text-gray-500">DMs Enviadas</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center text-purple-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="font-semibold">{post.send_rate}%</span>
            </div>
            <p className="text-xs text-gray-500">Taxa</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link to={`/posts/${post.media_id}`} className="w-full">
          <Button className="w-full">Ver Detalhes</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
