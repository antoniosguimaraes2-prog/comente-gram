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
      priceMonthly: 67,
      priceAnnual: 56,
      kiwifyUrl: "https://pay.kiwify.com.br/pro",
      features: [
        "3 contas Instagram",
        "Até 5.000 DMs/mês",
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                        <ArrowRight className="w-4 h-4 ml-2" />
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
                </CardContent>
              </Card>
            ))}
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
                    <td className="px-6 py-4 text-center text-sm">5.000</td>
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Messages Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Mensagens Adicionais
            </h2>
            <p className="text-xl text-gray-600">
              Excedeu seu limite? Compre mensagens avulsas sem mudar de plano
            </p>
          </div>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Pacotes de Mensagens
                </CardTitle>
              </div>
              <CardDescription className="text-lg">
                Flexibilidade total para seus picos de demanda
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">1.000 Mensagens Extras</h3>
                    <p className="text-gray-600">Válidas por 30 dias a partir da compra</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">R$ 12</div>
                    <div className="text-sm text-gray-500">único</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Compra avulsa, sem alterar seu plano</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Ativação automática quando exceder o limite</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Ideal para campanhas sazonais ou picos de demanda</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-yellow-600 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Como funciona</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Quando você atingir 100% do seu limite mensal de mensagens, suas automações serão pausadas.
                      Você pode comprar pacotes de 1.000 mensagens adicionais por R$ 12 para continuar operando
                      sem interrupções, mantendo seu plano atual.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => window.open('mailto:vendas@comentedm.com.br?subject=Interesse em Mensagens Adicionais', '_blank')}
                >
                  Comprar Mensagens Extras
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
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
                as automações são pausadas até o próximo ciclo de cobrança ou upgrade do plano.
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
                Plano Starter: suporte por email (resposta em até 24h). Professional: 
                suporte prioritário (resposta em até 4h). Enterprise: suporte dedicado com SLA.
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
                plan: "Professional",
                price: isAnnual ? 81 : 97,
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
