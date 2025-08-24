import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  CheckCircle, 
  Instagram, 
  ArrowRight, 
  Star,
  Zap,
  Users,
  BarChart3,
  Shield,
  Headphones,
  Crown,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const plans = [
    {
      name: "Gratuito",
      description: "Perfeito para começar",
      priceMonthly: 0,
      priceAnnual: 0,
      kiwifyUrl: "https://pay.kiwify.com.br/I3yr8ml",
      features: [
        "1 conta Instagram",
        "Até 100 DMs/mês",
        "3 campanhas ativas",
        "Palavras-chave ilimitadas",
        "Analytics básicos"
      ],
      highlight: false,
      cta: "Começar Grátis",
      isFree: true
    },
    {
      name: "Basic",
      description: "Para pequenos negócios",
      priceMonthly: 22,
      priceAnnual: 18,
      kiwifyUrl: "https://pay.kiwify.com.br/basic",
      features: [
        "1 conta Instagram",
        "Até 1.000 DMs/mês",
        "Campanhas ilimitadas",
        "Palavras-chave ilimitadas",
        "Analytics básicos"
      ],
      highlight: false,
      cta: "Escolher Basic"
    },
    {
      name: "Pro",
      description: "Para negócios em crescimento",
      priceMonthly: 45,
      priceAnnual: 38,
      kiwifyUrl: "https://pay.kiwify.com.br/pro",
      features: [
        "3 contas Instagram",
        "Até 8.000 DMs/mês",
        "Campanhas ilimitadas",
        "Palavras-chave ilimitadas",
        "Analytics avançados",
        "Automação com botões",
        "Suporte prioritário",
        "Relatórios personalizados"
      ],
      highlight: true,
      cta: "Mais Popular"
    },
    {
      name: "Agência",
      description: "Soluções personalizadas",
      priceMonthly: null,
      priceAnnual: null,
      kiwifyUrl: null,
      features: [
        "Contas ilimitadas",
        "DMs ilimitadas",
        "Campanhas ilimitadas",
        "Todas as funcionalidades",
        "Analytics empresariais",
        "API access",
        "Suporte dedicado",
        "Onboarding personalizado",
        "SLA garantido",
        "Gestão de conta dedicada"
      ],
      highlight: false,
      cta: "Falar com Time",
      isCustom: true
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/home" className="flex items-center space-x-2" onClick={scrollToTop}>
              <Instagram className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">ComenteDM</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/home" className="text-gray-600 hover:text-gray-900" onClick={scrollToTop}>
                Início
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
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Preços Transparentes
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
                Planos que crescem{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  com você
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Escolha o plano ideal para automatizar suas vendas no Instagram. 
                Comece grátis e escale conforme seu negócio cresce.
              </p>
            </div>

            {/* Annual/Monthly Toggle */}
            <div className="flex items-center justify-center space-x-4">
              <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Mensal
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-purple-600"
              />
              <span className={`text-sm ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Anual
              </span>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                20% OFF
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative border-2 transition-all hover:shadow-xl ${
                  plan.highlight 
                    ? 'border-purple-500 shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white border-purple-600 px-4 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  
                  <div className="space-y-2">
                    {plan.isCustom ? (
                      <div className="flex items-baseline justify-center space-x-1">
                        <span className="text-2xl font-bold text-gray-900">
                          Sob consulta
                        </span>
                      </div>
                    ) : plan.isFree ? (
                      <div className="flex items-baseline justify-center space-x-1">
                        <span className="text-4xl font-bold text-green-600">
                          Grátis
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-center space-x-1">
                          <span className="text-4xl font-bold">
                            R$ {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                          </span>
                          <span className="text-gray-500">/mês</span>
                        </div>
                        {isAnnual && (
                          <p className="text-sm text-green-600">
                            Economize R$ {(plan.priceMonthly - plan.priceAnnual) * 12}/ano
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    {plan.isCustom ? (
                      <Button
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        onClick={() => window.open('mailto:vendas@comentedm.com.br?subject=Interesse no Plano Agência', '_blank')}
                      >
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : plan.isFree ? (
                      <Link to="/auth" onClick={scrollToTop}>
                        <Button className="w-full h-12 bg-green-600 hover:bg-green-700">
                          {plan.cta}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                    ) : (
                      <Link
                        to="/checkout"
                        onClick={scrollToTop}
                        state={{
                          plan: plan.name,
                          price: isAnnual ? plan.priceAnnual : plan.priceMonthly,
                          billing: isAnnual ? 'annual' : 'monthly'
                        }}
                      >
                        <Button
                          className={`w-full h-12 ${
                            plan.highlight
                              ? 'bg-purple-600 hover:bg-purple-700'
                              : 'bg-gray-900 hover:bg-gray-800'
                          }`}
                        >
                          {plan.cta}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Basic Plan CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Comece com o plano Basic
            </h2>
            <p className="text-lg text-gray-600">
              Apenas R$ 22/mês para automatizar até 1.000 DMs e crescer seu negócio
            </p>
            <Link
              to="/checkout"
              onClick={scrollToTop}
              state={{
                plan: "Basic",
                price: isAnnual ? 18 : 22,
                billing: isAnnual ? 'annual' : 'monthly'
              }}
            >
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 h-12">
                Escolher Plano Basic
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Compare todos os recursos
            </h2>
            <p className="text-xl text-gray-600">
              Veja exatamente o que está incluído em cada plano
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Recursos</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Gratuito</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Basic</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Pro</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Agência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Contas Instagram</td>
                    <td className="px-6 py-4 text-center text-sm">1</td>
                    <td className="px-6 py-4 text-center text-sm">1</td>
                    <td className="px-6 py-4 text-center text-sm">3</td>
                    <td className="px-6 py-4 text-center text-sm">Ilimitadas</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">DMs por mês</td>
                    <td className="px-6 py-4 text-center text-sm">100</td>
                    <td className="px-6 py-4 text-center text-sm">1.000</td>
                    <td className="px-6 py-4 text-center text-sm">8.000</td>
                    <td className="px-6 py-4 text-center text-sm">Ilimitadas</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Campanhas ativas</td>
                    <td className="px-6 py-4 text-center text-sm">3</td>
                    <td className="px-6 py-4 text-center text-sm">Ilimitadas</td>
                    <td className="px-6 py-4 text-center text-sm">Ilimitadas</td>
                    <td className="px-6 py-4 text-center text-sm">Ilimitadas</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">Palavras-chave</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Analytics avançados</td>
                    <td className="px-6 py-4 text-center"><span className="text-gray-400">—</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-gray-400">—</span></td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">Automação com botões</td>
                    <td className="px-6 py-4 text-center"><span className="text-gray-400">—</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-gray-400">—</span></td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">API Access</td>
                    <td className="px-6 py-4 text-center"><span className="text-gray-400">—</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-gray-400">—</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-gray-400">—</span></td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">Suporte</td>
                    <td className="px-6 py-4 text-center text-sm">—</td>
                    <td className="px-6 py-4 text-center text-sm">—</td>
                    <td className="px-6 py-4 text-center text-sm">Prioritário</td>
                    <td className="px-6 py-4 text-center text-sm">Dedicado</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Mensagens Extras</td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-purple-600">R$ 12/1.000</td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-purple-600">R$ 12/1.000</td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-purple-600">R$ 12/1.000</td>
                    <td className="px-6 py-4 text-center text-sm">Sob consulta</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Another Basic Plan CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    Pronto para automatizar suas vendas?
                  </h3>
                  <p className="text-gray-600">
                    O plano Basic oferece tudo que você precisa para começar a converter comentários em vendas
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">R$ 22/mês</div>
                    <div className="text-sm text-gray-500">1.000 DMs mensais</div>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={scrollToTop}
                    state={{
                      plan: "Basic",
                      price: isAnnual ? 18 : 22,
                      billing: isAnnual ? 'annual' : 'monthly'
                    }}
                  >
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Escolher Basic Agora
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Tire suas dúvidas sobre nossos planos
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Posso mudar de plano a qualquer momento?</h3>
              <p className="text-gray-600">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                As mudanças são aplicadas imediatamente e você é cobrado proporcionalmente.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">O que acontece se eu exceder o limite de DMs?</h3>
              <p className="text-gray-600">
                Quando você atinge 80% do limite, enviamos um aviso. Se exceder 100%,
                as automações são pausadas até o próximo ciclo de cobrança, upgrade do plano ou
                compra de mensagens adicionais.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Como funcionam as mensagens adicionais?</h3>
              <p className="text-gray-600">
                Você pode comprar pacotes de 1.000 mensagens extras por R$ 12,00 sem alterar seu plano atual.
                Essas mensagens são válidas por 30 dias e são consumidas automaticamente quando você excede
                seu limite mensal.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">O plano gratuito tem limitações?</h3>
              <p className="text-gray-600">
                O plano gratuito oferece até 100 DMs por mês, 1 conta Instagram e 3 campanhas ativas.
                É perfeito para testar a plataforma e pequenos negócios que estão começando.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Como funciona a garantia?</h3>
              <p className="text-gray-600">
                Oferecemos garantia de 7 dias para todos os planos. Se não ficar satisfeito,
                devolvemos 100% do valor pago, sem perguntas.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Como funciona o suporte?</h3>
              <p className="text-gray-600">
                Planos Gratuito e Basic: sem suporte incluso. Plano Pro:
                suporte prioritário (resposta em até 4h). Plano Agência: suporte dedicado com SLA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Pronto para automatizar suas vendas?
            </h2>
            <p className="text-xl">
              Escolha seu plano e comece a converter comentários em vendas hoje mesmo
            </p>
            <Link
              to="/checkout"
              onClick={scrollToTop}
              state={{
                plan: "Pro",
                price: isAnnual ? 56 : 67,
                billing: isAnnual ? 'annual' : 'monthly'
              }}
            >
              <Button size="lg" variant="secondary" className="text-lg px-8 h-12">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-sm opacity-80">
              Garantia de 7 dias • Suporte completo • Resultados garantidos
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
