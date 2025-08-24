import { useAuth } from "@/providers/AuthProvider";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, MessageCircle, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/campaigns" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">ComenteDM</div>
          <Link to="/auth">
            <Button>Entrar</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
              Automatize DMs no{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Instagram
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Envie mensagens automáticas para quem comenta em suas postagens usando palavras-chave específicas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                Começar Grátis
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Ver Como Funciona
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Conecte Seu Instagram</CardTitle>
                <CardDescription>
                  Integração oficial com Instagram Business via Meta OAuth
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Monitore Comentários</CardTitle>
                <CardDescription>
                  Defina palavras-chave e monitore comentários em tempo real
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>DMs Automáticas</CardTitle>
                <CardDescription>
                  Envie mensagens personalizadas automaticamente para leads interessados
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* CTA */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border mt-16">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Pronto para automatizar suas vendas?
              </h2>
              <p className="text-gray-600">
                Conecte seu Instagram em 2 minutos e comece a converter comentários em vendas.
              </p>
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  Criar Conta Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>&copy; 2024 ComenteDM. Automação inteligente para Instagram Business.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
