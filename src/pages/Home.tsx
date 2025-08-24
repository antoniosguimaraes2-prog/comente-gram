import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Instagram, 
  MessageCircle, 
  TrendingUp, 
  Zap, 
  CheckCircle, 
  Star,
  ArrowRight,
  Play,
  Users,
  BarChart3,
  Shield,
  Clock,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Home = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Instagram className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">ComenteDM</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900" onClick={scrollToTop}>
                Preços
              </Link>
              <Link to="/auth" className="text-gray-600 hover:text-gray-900" onClick={scrollToTop}>
                Entrar
              </Link>
              <Link to="/auth" onClick={scrollToTop}>
                <Button>Começar Grátis</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  <Zap className="w-3 h-3 mr-1" />
                  Automação Instagram
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Transforme{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                    comentários
                  </span>{" "}
                  em vendas
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Automatize DMs no Instagram baseadas em comentários. 
                  Aumente suas vendas em até 300% com respostas inteligentes e personalizadas.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth" onClick={scrollToTop}>
                  <Button size="lg" className="text-lg px-8 h-12">
                    Começar Grátis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 h-12"
                  onClick={() => {
                    localStorage.setItem('comente_dm_mvp_mode', 'true');
                    window.location.href = '/';
                  }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Usar sem Login
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Grátis para começar</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Configuração em 2 minutos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Sem cartão de crédito</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border">
                <div className="space-y-6">
                  {/* Instagram Post Mockup */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-sm">sua_empresa</p>
                        <p className="text-xs text-gray-500">há 2 horas</p>
                      </div>
                    </div>

                    <img
                      src="https://images.pexels.com/photos/3781528/pexels-photo-3781528.jpeg"
                      alt="Mulher usando tablet profissionalmente"
                      className="w-full h-32 object-cover rounded-lg"
                    />

                    <div className="space-y-2">
                      <p className="text-sm"><strong>sua_empresa</strong> Novo produto chegando! 🚀</p>
                      
                      {/* Comments */}
                      <div className="space-y-2 text-xs bg-gray-50 p-3 rounded">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0"></div>
                          <div>
                            <p><strong>joao_silva</strong> Interessado! Qual o preço?</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Zap className="w-3 h-3 text-green-500" />
                              <span className="text-green-600 font-medium">DM Automática Enviada!</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-4 border">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-semibold">+300%</p>
                    <p className="text-xs text-gray-500">Conversões</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4 border">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold">24/7</p>
                    <p className="text-xs text-gray-500">Automação</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
              Como funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Em 3 passos simples, você automatiza suas vendas no Instagram
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center p-6">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>1. Conecte seu Instagram</CardTitle>
                <CardDescription>
                  Conecte sua conta Business de forma segura via Meta OAuth
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg text-center p-6">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>2. Configure Palavras-chave</CardTitle>
                <CardDescription>
                  Defina quais comentários ativam as DMs automáticas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg text-center p-6">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>3. Automatize Vendas</CardTitle>
                <CardDescription>
                  Respostas automáticas convertem comentários em vendas 24/7
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Já são mais de 2000 clientes automatizando o DM rapidamente
            </p>
            <p className="text-lg text-gray-500">
              Resultados reais de empresas que automatizaram suas vendas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">
                  "Aumentei minhas vendas em 250% no primeiro mês. O ComenteDM transformou 
                  meu Instagram em uma máquina de vendas automática!"
                </p>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-purple-100 text-purple-600">MC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Maria Clara</p>
                    <p className="text-sm text-gray-500">Loja de Roupas Online</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">
                  "Economizo 4 horas por dia que gastava respondendo DMs. Agora foco no que 
                  realmente importa: criar conteúdo de qualidade."
                </p>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-600">JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">João Santos</p>
                    <p className="text-sm text-gray-500">Coach Digital</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">
                  "Implementação super fácil e resultados imediatos. Em 2 semanas já 
                  tinha recuperado o investimento."
                </p>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-green-100 text-green-600">AF</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Ana Ferreira</p>
                    <p className="text-sm text-gray-500">Produtos Artesanais</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Benefits Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Por que escolher o ComenteDM?
            </h2>
            <p className="text-xl text-gray-300">
              A solução mais completa para automação de vendas no Instagram
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-purple-600 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">24/7 Automático</h3>
              <p className="text-gray-300">
                Trabalha enquanto você dorme. Nunca perca uma oportunidade de venda.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Analytics Detalhados</h3>
              <p className="text-gray-300">
                Acompanhe métricas em tempo real e otimize suas campanhas.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">100% Seguro</h3>
              <p className="text-gray-300">
                Certificado pelo Meta. Seus dados e conta estão completamente seguros.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-orange-600 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Suporte Premium</h3>
              <p className="text-gray-300">
                Equipe especializada para te ajudar a maximizar seus resultados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Pronto para aumentar suas vendas?
            </h2>
            <p className="text-xl">
              Junte-se a milhares de empresas que já automatizaram suas vendas no Instagram
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth" onClick={scrollToTop}>
                <Button size="lg" variant="secondary" className="text-lg px-8 h-12">
                  Começar Grátis Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/pricing" onClick={scrollToTop}>
                <Button size="lg" variant="outline" className="text-lg px-8 h-12 border-white text-white hover:bg-white hover:text-purple-600 bg-transparent">
                  Ver Planos
                </Button>
              </Link>
            </div>
            <p className="text-sm opacity-80">
              Sem compromisso • Cancelamento a qualquer momento • Suporte 24/7
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
