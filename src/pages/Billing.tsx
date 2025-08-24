import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  FileText,
  CheckCircle,
  AlertCircle,
  Plus,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

const Billing = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { isInMVPMode } = useAuth();

  // Mock billing data for MVP mode
  const mockBillingData = {
    currentPlan: "Pro",
    planPrice: "R$ 97,00",
    billingCycle: "mensal",
    nextBillingDate: "2024-02-15",
    paymentMethod: "**** **** **** 4532",
    invoices: [
      {
        id: "INV-2024-001",
        date: "2024-01-15",
        amount: "R$ 97,00",
        status: "paid",
        downloadUrl: "#"
      },
      {
        id: "INV-2023-012",
        date: "2023-12-15", 
        amount: "R$ 97,00",
        status: "paid",
        downloadUrl: "#"
      },
      {
        id: "INV-2023-011",
        date: "2023-11-15",
        amount: "R$ 97,00", 
        status: "paid",
        downloadUrl: "#"
      }
    ],
    usage: {
      campaigns: 3,
      campaignsLimit: 10,
      dmsSent: 245,
      dmsLimit: 1000,
      commentsMonitored: 1234,
      commentsLimit: 5000
    }
  };

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "R$ 47",
      period: "/mês",
      description: "Perfeito para começar",
      features: [
        "Até 3 campanhas",
        "500 DMs por mês",
        "2.000 comentários monitorados",
        "Suporte por email"
      ],
      popular: false
    },
    {
      id: "pro",
      name: "Pro",
      price: "R$ 97",
      period: "/mês",
      description: "Para vendedores sérios",
      features: [
        "Até 10 campanhas",
        "1.000 DMs por mês",
        "5.000 comentários monitorados",
        "Suporte prioritário",
        "Analytics avançados"
      ],
      popular: true
    },
    {
      id: "agency",
      name: "Agency",
      price: "R$ 197",
      period: "/mês",
      description: "Para agências e equipes",
      features: [
        "Campanhas ilimitadas",
        "5.000 DMs por mês",
        "20.000 comentários monitorados",
        "Suporte 24/7",
        "API personalizada",
        "Múltiplas contas"
      ],
      popular: false
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-gray-600">
              Gerencie sua assinatura, faturas e uso da plataforma
            </p>
          </div>
        </div>

        <Tabs defaultValue="billing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="billing">Cobrança</TabsTrigger>
            <TabsTrigger value="usage">Uso</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
          </TabsList>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Plano Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-2xl font-bold">{mockBillingData.currentPlan}</h3>
                      <Badge variant="default">Ativo</Badge>
                    </div>
                    <p className="text-3xl font-bold text-green-600 mb-2">
                      {mockBillingData.planPrice}
                      <span className="text-lg font-normal text-gray-600">/{mockBillingData.billingCycle}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Próxima cobrança: {new Date(mockBillingData.nextBillingDate).toLocaleDateString("pt-BR")}
                    </p>
                    <div className="flex gap-2">
                      <Link to="/pricing">
                        <Button variant="outline" size="sm">
                          Alterar Plano
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        Cancelar Assinatura
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Método de Pagamento</h4>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{mockBillingData.paymentMethod}</p>
                        <p className="text-sm text-gray-600">Expira em 12/2027</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3">
                      Atualizar Cartão
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Histórico de Faturas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockBillingData.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium">{invoice.id}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(invoice.date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          Pago
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{invoice.amount}</span>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Campanhas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usado</span>
                      <span>{mockBillingData.usage.campaigns} de {mockBillingData.usage.campaignsLimit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(mockBillingData.usage.campaigns / mockBillingData.usage.campaignsLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">DMs Enviadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usado</span>
                      <span>{mockBillingData.usage.dmsSent} de {mockBillingData.usage.dmsLimit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(mockBillingData.usage.dmsSent / mockBillingData.usage.dmsLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Comentários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usado</span>
                      <span>{mockBillingData.usage.commentsMonitored} de {mockBillingData.usage.commentsLimit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${(mockBillingData.usage.commentsMonitored / mockBillingData.usage.commentsLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Seu uso é calculado mensalmente e redefine no dia da cobrança.
                Quando você atingir o limite, as automações serão pausadas automaticamente.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.popular ? 'border-blue-500' : ''}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      Mais Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      {plan.id === "pro" && <Badge variant="outline">Atual</Badge>}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full" 
                      variant={plan.id === "pro" ? "outline" : "default"}
                      disabled={plan.id === "pro"}
                    >
                      {plan.id === "pro" ? "Plano Atual" : "Selecionar Plano"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Billing;
