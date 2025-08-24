import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle,
  Instagram,
  CreditCard,
  Shield,
  ArrowLeft,
  Lock,
  Calendar,
  User,
  Mail,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const planData = location.state || {
    plan: "Professional",
    price: 97,
    billing: "monthly"
  };

  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    name: "",
  });

  // Check if this is a success page
  const paymentId = searchParams.get('payment_id');
  const isSuccessPage = paymentId !== null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer uma compra. Redirecionando...",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call our Supabase function to create Kiwify checkout
      const { data, error: functionError } = await supabase.functions.invoke('kiwify-checkout', {
        body: {
          planName: planData.plan,
          planPrice: planData.price,
          billingCycle: planData.billing,
          customerEmail: formData.email,
          customerName: formData.name,
          userId: user.id
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao processar checkout');
      }

      // Redirect to Kiwify checkout
      window.location.href = data.checkout_url;

    } catch (error) {
      console.error('Checkout error:', error);
      setError(error instanceof Error ? error.message : 'Erro inesperado ao processar pagamento');
      toast({
        title: "Erro no Checkout",
        description: "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check payment status on success page
  useEffect(() => {
    if (isSuccessPage && paymentId) {
      checkPaymentStatus(paymentId);
    }
  }, [isSuccessPage, paymentId]);

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('status, plan_name')
        .eq('id', paymentId)
        .single();

      if (error) {
        console.error('Error checking payment status:', error);
        return;
      }

      if (data.status === 'approved') {
        toast({
          title: "✅ Pagamento Confirmado!",
          description: `Bem-vindo ao plano ${data.plan_name}! Sua conta foi ativada.`,
        });
        // Redirect to dashboard after a few seconds
        setTimeout(() => {
          navigate("/campaigns");
        }, 3000);
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    }
  };

  const isFormValid = formData.email && formData.name;

  // Success page rendering
  if (isSuccessPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2">
                <Instagram className="w-8 h-8 text-purple-600" />
                <span className="text-xl font-bold text-gray-900">ComenteDM</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Pagamento Recebido!
              </h1>
              <p className="text-lg text-gray-600">
                Estamos processando seu pagamento. Você receberá um email de confirmação em instantes.
              </p>
              <p className="text-sm text-gray-500">
                Redirecionando para o dashboard...
              </p>
            </div>

            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>

            <Link to="/campaigns">
              <Button>
                Ir para Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Instagram className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">ComenteDM</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">Checkout Seguro</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/pricing" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Planos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
          <p className="text-gray-600 mt-2">Complete sua assinatura e comece a automatizar suas vendas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Informações da Conta</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Checkout Seguro</span>
                </CardTitle>
                <CardDescription>
                  Após confirmar, você será redirecionado para o pagamento seguro via Kiwify
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Pagamento 100% Seguro</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Processamento seguro via Kiwify. Aceitamos todas as principais bandeiras de cartão,
                    PIX e boleto bancário.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Pagamento processado de forma segura via SSL</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{planData.plan}</h3>
                      <p className="text-sm text-gray-600">
                        Cobrança {planData.billing === 'annual' ? 'anual' : 'mensal'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ {planData.price}/mês</p>
                      {planData.billing === 'annual' && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 mt-1">
                          20% OFF
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {planData.billing === 'annual' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Subtotal (12 meses)</span>
                        <span>R$ {planData.price * 12}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto anual (20%)</span>
                        <span>- R$ {(planData.price * 12 * 0.2).toFixed(0)}</span>
                      </div>
                      <Separator />
                    </>
                  )}

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total {planData.billing === 'annual' ? '(1º ano)' : '(mensal)'}</span>
                    <span>
                      R$ {planData.billing === 'annual' ? (planData.price * 12 * 0.8).toFixed(0) : planData.price}
                      {planData.billing === 'monthly' ? '/mês' : '/ano'}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">7 dias de teste grátis</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Você não será cobrado durante o período de teste. 
                    Cancele a qualquer momento sem custos.
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid || loading}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Criando checkout...</span>
                    </div>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Ir para Pagamento Seguro
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Ao finalizar a compra, você concorda com nossos{' '}
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link to="/privacy" className="text-blue-600 hover:underline">
                    Política de Privacidade
                  </Link>
                </p>
              </CardContent>
            </Card>

            {/* Features Included */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Incluído no seu plano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Automação 24/7 de DMs</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Analytics em tempo real</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Suporte especializado</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Configuração guiada</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Cancelamento a qualquer momento</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Pagamento Seguro</span>
              </div>
              <p className="text-xs text-gray-600">
                Utilizamos criptografia SSL de 256 bits e não armazenamos dados do seu cartão. 
                Processamento seguro via Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
