# Integração com Kiwify - Documentação

## Visão Geral

A integração com o Kiwify permite processar pagamentos diretamente no seu site, mantendo o usuário em sua plataforma enquanto utiliza o gateway de pagamento seguro do Kiwify.

## Como Funciona

1. **Checkout Interno**: Usuário preenche dados básicos na página `/checkout`
2. **API do Kiwify**: Sistema cria uma sessão de checkout via API do Kiwify
3. **Redirecionamento**: Usuário é levado para o checkout seguro do Kiwify
4. **Webhook**: Kiwify notifica seu sistema sobre o status do pagamento
5. **Ativação**: Sistema ativa automaticamente a assinatura do usuário

## Configuração Necessária

### 1. Variáveis de Ambiente

Você precisa configurar as seguintes variáveis no Supabase:

```bash
KIWIFY_API_TOKEN=seu_token_da_api_kiwify
KIWIFY_WEBHOOK_SECRET=seu_secret_do_webhook
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### 2. Configuração no Kiwify

1. **Crie uma conta no Kiwify**
2. **Configure seus produtos** com os IDs:
   - Starter: `I3yr8ml`
   - Professional: `p3DiSE2`
   - Enterprise: `YFtrvqI`
3. **Configure o webhook** apontando para:
   ```
   https://seu-projeto.supabase.co/functions/v1/kiwify-webhook
   ```
4. **Obtenha o API Token** nas configurações da conta

## Estrutura das Funções

### 1. `kiwify-checkout`
- **Endpoint**: `/functions/v1/kiwify-checkout`
- **Método**: POST
- **Função**: Cria sessão de checkout no Kiwify
- **Parâmetros**:
  ```json
  {
    "planName": "Professional",
    "planPrice": 97,
    "billingCycle": "monthly",
    "customerEmail": "user@example.com",
    "customerName": "Nome do Usuario",
    "userId": "uuid-do-usuario"
  }
  ```

### 2. `kiwify-webhook`
- **Endpoint**: `/functions/v1/kiwify-webhook`
- **Método**: POST
- **Função**: Processa notificações de pagamento do Kiwify
- **Headers**: `x-kiwify-signature` (verificação de segurança)

### 3. `check-subscription`
- **Endpoint**: `/functions/v1/check-subscription`
- **Método**: GET
- **Função**: Verifica status da assinatura do usuário
- **Autenticação**: Bearer token necessário

## Estrutura do Banco de Dados

### Tabela `payments`
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  plan_name TEXT NOT NULL,
  plan_price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_email TEXT,
  customer_name TEXT,
  kiwify_product_id TEXT NOT NULL,
  kiwify_checkout_id TEXT,
  kiwify_payment_id TEXT,
  checkout_url TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT
);
```

### Tabela `user_subscriptions`
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  plan_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  kiwify_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Fluxo de Pagamento

### 1. Usuário Inicia Checkout
```javascript
// No frontend (src/pages/Checkout.tsx)
const response = await supabase.functions.invoke('kiwify-checkout', {
  body: {
    planName: 'Professional',
    planPrice: 97,
    billingCycle: 'monthly',
    customerEmail: 'user@email.com',
    customerName: 'Nome Usuario',
    userId: user.id
  }
});

// Sistema redireciona para Kiwify
window.location.href = response.data.checkout_url;
```

### 2. Kiwify Processa Pagamento
- Usuário preenche dados de pagamento no Kiwify
- Kiwify processa o pagamento
- Kiwify envia webhook para seu sistema

### 3. Sistema Recebe Webhook
```javascript
// Webhook processa automaticamente:
// - Atualiza status do pagamento
// - Cria/ativa assinatura do usuário
// - Atualiza perfil do usuário
```

### 4. Usuário Retorna ao Site
- Kiwify redireciona para `/checkout/success?payment_id=xxx`
- Sistema verifica status do pagamento
- Usuário é direcionado para o dashboard

## Hook de Assinatura

Use o hook `useSubscription` para verificar status:

```javascript
import { useSubscription } from '@/hooks/use-subscription';

const { 
  hasActiveSubscription,
  subscription,
  subscriptionStatus,
  daysUntilExpiry,
  isPlanActive 
} = useSubscription();

// Verificar se tem plano ativo
if (hasActiveSubscription) {
  // Usuário tem assinatura ativa
}

// Verificar plano específico
if (isPlanActive('Professional')) {
  // Usuário tem plano Professional
}
```

## Segurança

1. **Verificação de Assinatura**: Webhooks verificam assinatura HMAC
2. **RLS (Row Level Security)**: Tabelas protegidas por políticas
3. **Tokens JWT**: Autenticação via Supabase Auth
4. **HTTPS**: Toda comunicação via HTTPS

## Status de Pagamento

- `pending`: Pagamento criado, aguardando processamento
- `approved`: Pagamento aprovado e assinatura ativa
- `refused`: Pagamento recusado
- `chargeback`: Estorno solicitado
- `refunded`: Reembolso processado
- `failed`: Erro no processamento

## Webhooks do Kiwify

O Kiwify enviará webhooks para os seguintes eventos:

- `payment.created`: Pagamento criado
- `payment.approved`: Pagamento aprovado
- `payment.refused`: Pagamento recusado
- `payment.chargeback`: Chargeback recebido
- `payment.refunded`: Reembolso processado

## Testando a Integração

1. **Configure as variáveis de ambiente**
2. **Execute as migrações do banco**:
   ```bash
   supabase db reset
   ```
3. **Deploy das funções**:
   ```bash
   supabase functions deploy kiwify-checkout
   supabase functions deploy kiwify-webhook
   supabase functions deploy check-subscription
   ```
4. **Teste o fluxo completo**:
   - Acesse `/pricing`
   - Selecione um plano
   - Complete o checkout
   - Verifique webhook no dashboard do Kiwify

## Suporte

Para dúvidas sobre a API do Kiwify, consulte:
- [Documentação oficial do Kiwify](https://developers.kiwify.com.br)
- [Suporte do Kiwify](https://help.kiwify.com.br)
