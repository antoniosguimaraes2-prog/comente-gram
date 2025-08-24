import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, Shield, Eye, Database, Users, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/home" className="flex items-center space-x-2">
              <Instagram className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">ComenteDM</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/home" className="text-gray-600 hover:text-gray-900">
                Início
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-gray-900">
                Termos
              </Link>
              <Link to="/auth">
                <Button>Entrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
              <h1 className="text-4xl font-bold text-gray-900">Política de Privacidade</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sua privacidade é fundamental. Entenda como coletamos, usamos e protegemos seus dados.
            </p>
            <p className="text-sm text-gray-500">Última atualização: Janeiro de 2024</p>
          </div>

          {/* Quick Overview */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <span>Resumo Rápido</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-sm">Dados Coletados</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Apenas informações necessárias para o funcionamento do serviço
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-sm">Segurança</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Criptografia SSL e armazenamento seguro em servidores certificados
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-sm">Compartilhamento</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Nunca vendemos ou compartilhamos seus dados com terceiros
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">1. Informações que Coletamos</h2>
              
              <h3 className="text-xl font-semibold text-gray-800">1.1 Informações de Conta</h3>
              <p className="text-gray-600">
                Quando você cria uma conta, coletamos:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Endereço de email</li>
                <li>Nome completo</li>
                <li>Informações de billing (quando aplicável)</li>
                <li>Credenciais de autenticação (criptografadas)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800">1.2 Dados do Instagram</h3>
              <p className="text-gray-600">
                Com sua autorização explícita via Meta OAuth, acessamos:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Informações básicas da conta Business</li>
                <li>Comentários em suas publicações</li>
                <li>Capacidade de enviar mensagens diretas</li>
                <li>Estatísticas básicas de engajamento</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800">1.3 Dados de Uso</h3>
              <p className="text-gray-600">
                Para melhorar nosso serviço, coletamos dados anonimizados sobre:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Como você usa nossa plataforma</li>
                <li>Frequência de acesso</li>
                <li>Recursos mais utilizados</li>
                <li>Informações técnicas (IP, navegador, dispositivo)</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">2. Como Usamos suas Informações</h2>
              
              <p className="text-gray-600">
                Utilizamos seus dados exclusivamente para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Fornecer o serviço:</strong> Automatizar DMs baseadas em comentários do Instagram</li>
                <li><strong>Melhorar a experiência:</strong> Personalizar e otimizar nossa plataforma</li>
                <li><strong>Suporte técnico:</strong> Resolver problemas e prestar assistência</li>
                <li><strong>Comunicação:</strong> Enviar atualizações importantes sobre o serviço</li>
                <li><strong>Segurança:</strong> Proteger sua conta e prevenir uso indevido</li>
                <li><strong>Compliance:</strong> Cumprir obrigações legais e regulamentares</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">3. Compartilhamento de Dados</h2>
              
              <p className="text-gray-600">
                <strong>Nunca vendemos seus dados.</strong> Compartilhamos informações apenas nas seguintes situações:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Provedores de serviço:</strong> Com parceiros que nos ajudam a operar a plataforma (ex: hospedagem, processamento de pagamentos)</li>
                <li><strong>Meta/Instagram:</strong> Dados necessários para integração via API oficial</li>
                <li><strong>Obrigações legais:</strong> Quando exigido por lei ou autoridades competentes</li>
                <li><strong>Proteção de direitos:</strong> Para proteger nossos direitos, propriedade ou segurança</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">4. Segurança dos Dados</h2>
              
              <p className="text-gray-600">
                Implementamos medidas rigorosas de segurança:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Criptografia:</strong> SSL/TLS para transmissão e AES-256 para armazenamento</li>
                <li><strong>Acesso restrito:</strong> Apenas funcionários autorizados podem acessar dados</li>
                <li><strong>Auditoria:</strong> Monitoramento contínuo e logs de acesso</li>
                <li><strong>Infraestrutura:</strong> Servidores em datacenters certificados (AWS/Google Cloud)</li>
                <li><strong>Backups:</strong> Cópias de segurança criptografadas e testadas regularmente</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">5. Seus Direitos (LGPD)</h2>
              
              <p className="text-gray-600">
                Conforme a Lei Geral de Proteção de Dados, você tem direito a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Acesso:</strong> Saber quais dados pessoais possuímos sobre você</li>
                <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li><strong>Eliminação:</strong> Excluir dados desnecessários ou tratados em desconformidade</li>
                <li><strong>Portabilidade:</strong> Receber uma cópia dos seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> Se opor ao tratamento realizado com base no legítimo interesse</li>
                <li><strong>Revogação:</strong> Revogar consentimento a qualquer momento</li>
              </ul>
              
              <p className="text-gray-600">
                Para exercer seus direitos, entre em contato conosco através do email: <strong>privacidade@comentedm.com.br</strong>
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">6. Retenção de Dados</h2>
              
              <p className="text-gray-600">
                Mantemos seus dados pelo tempo necessário para:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Fornecer nossos serviços enquanto sua conta estiver ativa</li>
                <li>Cumprir obrigações legais (normalmente 5 anos)</li>
                <li>Resolver disputas e fazer cumprir nossos acordos</li>
              </ul>
              
              <p className="text-gray-600">
                Quando você cancela sua conta, excluímos seus dados dentro de 30 dias, exceto informações que devemos manter por obrigação legal.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">7. Cookies e Tecnologias Similares</h2>
              
              <p className="text-gray-600">
                Usamos cookies para:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Manter você logado</li>
                <li>Lembrar suas preferências</li>
                <li>Analisar como você usa nosso site</li>
                <li>Melhorar a experiência do usuário</li>
              </ul>
              
              <p className="text-gray-600">
                Você pode controlar cookies através das configurações do seu navegador.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">8. Alterações nesta Política</h2>
              
              <p className="text-gray-600">
                Podemos atualizar esta política ocasionalmente. Quando o fizermos:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Atualizaremos a data de "última modificação"</li>
                <li>Notificaremos sobre mudanças significativas por email</li>
                <li>Publicaremos a nova versão em nosso site</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">9. Contato</h2>
              
              <p className="text-gray-600">
                Para questões sobre esta política de privacidade, entre em contato:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li><strong>Email:</strong> privacidade@comentedm.com.br</li>
                <li><strong>Endereço:</strong> [Endereço da empresa]</li>
                <li><strong>DPO:</strong> dpo@comentedm.com.br</li>
              </ul>
            </section>
          </div>

          {/* CTA */}
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Tem alguma dúvida sobre nossa política?
            </h3>
            <p className="text-gray-600 mb-6">
              Nossa equipe está sempre disponível para esclarecer questões sobre privacidade e proteção de dados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline">
                Entrar em Contato
              </Button>
              <Link to="/terms">
                <Button variant="outline">
                  Ver Termos de Uso
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
