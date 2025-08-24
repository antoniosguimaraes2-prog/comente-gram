import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Instagram className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">ComenteDM</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Início
              </Link>
              <Link to="/privacy" className="text-gray-600 hover:text-gray-900">
                Privacidade
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
              <FileText className="w-8 h-8 text-purple-600" />
              <h1 className="text-4xl font-bold text-gray-900">Termos de Uso</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Condições gerais para uso da plataforma ComenteDM de automação de DMs no Instagram.
            </p>
            <p className="text-sm text-gray-500">Última atualização: Janeiro de 2024</p>
          </div>

          {/* Important Notice */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span>Importante</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800">
                Ao usar nossos serviços, você concorda com estes termos. Leia-os cuidadosamente. 
                Se não concordar, não use nossa plataforma.
              </p>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">1. Definições</h2>
              
              <p className="text-gray-600">
                Para os fins destes termos:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li><strong>"Plataforma"</strong> refere-se ao ComenteDM e todos os seus serviços</li>
                <li><strong>"Usuário"</strong> é qualquer pessoa que utiliza nossos serviços</li>
                <li><strong>"Conta"</strong> é o perfil criado para acessar a plataforma</li>
                <li><strong>"Conteúdo"</strong> inclui textos, imagens, dados e outras informações</li>
                <li><strong>"Serviços"</strong> são todas as funcionalidades oferecidas pela plataforma</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">2. Aceitação dos Termos</h2>
              
              <p className="text-gray-600">
                Ao criar uma conta ou usar nossos serviços, você:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Confirma ter lido e compreendido estes termos</li>
                <li>Concorda em cumprir todas as condições aqui estabelecidas</li>
                <li>Declara ter capacidade legal para firmar este acordo</li>
                <li>Aceita nossa Política de Privacidade</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">3. Descrição dos Serviços</h2>
              
              <p className="text-gray-600">
                O ComenteDM oferece:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Automação de DMs:</strong> Envio automático de mensagens diretas no Instagram baseado em comentários</li>
                <li><strong>Monitoramento:</strong> Análise de comentários em suas publicações</li>
                <li><strong>Analytics:</strong> Relatórios e estatísticas de desempenho</li>
                <li><strong>Configuração:</strong> Personalização de palavras-chave e mensagens</li>
                <li><strong>Suporte:</strong> Assistência técnica e orientação</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">4. Requisitos da Conta</h2>
              
              <h3 className="text-xl font-semibold text-gray-800">4.1 Elegibilidade</h3>
              <p className="text-gray-600">
                Para usar nossos serviços, você deve:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Ter pelo menos 18 anos de idade</li>
                <li>Possuir uma conta Instagram Business válida</li>
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Ter autorização para representar a empresa/marca</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800">4.2 Responsabilidades</h3>
              <p className="text-gray-600">
                Você é responsável por:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Manter a segurança de suas credenciais</li>
                <li>Todas as atividades realizadas em sua conta</li>
                <li>Notificar imediatamente sobre uso não autorizado</li>
                <li>Manter informações atualizadas</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">5. Uso Aceitável</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span>Permitido</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li>• Automatizar respostas a comentários legítimos</li>
                      <li>• Usar para fins comerciais legais</li>
                      <li>• Personalizar mensagens de forma ética</li>
                      <li>• Compartilhar feedback construtivo</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-800">
                      <XCircle className="w-5 h-5" />
                      <span>Proibido</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-red-700">
                      <li>• Spam ou mensagens não solicitadas</li>
                      <li>• Conteúdo ilegal, ofensivo ou discriminatório</li>
                      <li>• Violação de direitos autorais</li>
                      <li>• Tentativas de hackeamento</li>
                      <li>• Revenda ou sublicenciamento</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">6. Conformidade com Instagram/Meta</h2>
              
              <p className="text-gray-600">
                Você concorda em:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Cumprir integralmente os Termos de Uso do Instagram/Meta</li>
                <li>Respeitar limites de API e políticas da plataforma</li>
                <li>Não violar diretrizes de comunidade do Instagram</li>
                <li>Usar apenas contas Instagram Business autênticas</li>
                <li>Não criar ou usar contas falsas</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">7. Pagamentos e Assinaturas</h2>
              
              <h3 className="text-xl font-semibold text-gray-800">7.1 Planos e Preços</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Preços são cobrados conforme o plano escolhido</li>
                <li>Cobrança mensal ou anual, conforme selecionado</li>
                <li>Preços podem ser alterados com aviso prévio de 30 dias</li>
                <li>Impostos aplicáveis são de responsabilidade do usuário</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800">7.2 Cancelamento</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Cancelamento pode ser feito a qualquer momento</li>
                <li>Serviços continuam até o fim do período pago</li>
                <li>Não há reembolso proporcional por cancelamento antecipado</li>
                <li>Dados são excluídos 30 dias após cancelamento</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">8. Limitações de Responsabilidade</h2>
              
              <p className="text-gray-600">
                Nossa responsabilidade é limitada ao máximo permitido por lei:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Não garantimos disponibilidade 100% dos serviços</li>
                <li>Não somos responsáveis por ações de terceiros (Instagram/Meta)</li>
                <li>Não garantimos resultados específicos de vendas</li>
                <li>Responsabilidade máxima limitada ao valor pago nos últimos 12 meses</li>
                <li>Não somos responsáveis por danos indiretos ou lucros cessantes</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">9. Propriedade Intelectual</h2>
              
              <h3 className="text-xl font-semibold text-gray-800">9.1 Nossa Propriedade</h3>
              <p className="text-gray-600">
                Reservamos todos os direitos sobre:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Software, algoritmos e tecnologia da plataforma</li>
                <li>Marca, logo e materiais de marketing</li>
                <li>Documentação e conteúdo educativo</li>
                <li>Dados agregados e insights (anonimizados)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800">9.2 Sua Propriedade</h3>
              <p className="text-gray-600">
                Você mantém todos os direitos sobre:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Seu conteúdo e dados de conta</li>
                <li>Mensagens e templates criados</li>
                <li>Informações de clientes e leads</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">10. Rescis��o</h2>
              
              <p className="text-gray-600">
                Podemos encerrar sua conta se:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Você violar estes termos</li>
                <li>Usar os serviços de forma fraudulenta</li>
                <li>Não pagar taxas devidas</li>
                <li>Representar risco à nossa operação</li>
              </ul>
              
              <p className="text-gray-600 mt-4">
                Em caso de rescisão, você terá 30 dias para exportar seus dados antes da exclusão permanente.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">11. Alterações nos Termos</h2>
              
              <p className="text-gray-600">
                Podemos modificar estes termos:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Com aviso prévio de 30 dias por email</li>
                <li>Publicando a nova versão em nosso site</li>
                <li>Destacando mudanças significativas</li>
              </ul>
              
              <p className="text-gray-600 mt-4">
                O uso continuado após as alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">12. Lei Aplicável e Jurisdição</h2>
              
              <p className="text-gray-600">
                Estes termos são regidos pela legislação brasileira. Disputas serão resolvidas:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Preferencialmente por mediação ou arbitragem</li>
                <li>Na comarca da sede da empresa</li>
                <li>Seguindo as normas do Código de Defesa do Consumidor</li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">13. Contato</h2>
              
              <p className="text-gray-600">
                Para questões sobre estes termos:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li><strong>Email:</strong> legal@comentedm.com.br</li>
                <li><strong>Suporte:</strong> suporte@comentedm.com.br</li>
                <li><strong>Endereço:</strong> [Endereço da empresa]</li>
              </ul>
            </section>
          </div>

          {/* CTA */}
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Pronto para começar?
            </h3>
            <p className="text-gray-600 mb-6">
              Ao criar sua conta, você concorda com estes termos e nossa política de privacidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button>
                  Criar Conta Grátis
                </Button>
              </Link>
              <Link to="/privacy">
                <Button variant="outline">
                  Ver Política de Privacidade
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

export default Terms;
