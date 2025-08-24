# Configuração do Login com Google

Este guia mostra como configurar o login com Google usando Supabase Auth.

## Pré-requisitos

- Conta no Google Cloud Console
- Projeto Supabase configurado
- Domínio personalizado (recomendado para produção)

## 1. Configuração no Google Cloud Console

### 1.1 Criar Projeto (se necessário)

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em "Selecionar projeto" → "Novo projeto"
3. Digite o nome do projeto e clique em "Criar"

### 1.2 Ativar APIs

1. No menu lateral, vá em **APIs e Serviços** → **Biblioteca**
2. Pesquise por "Google+ API" e clique em **Ativar**
3. Pesquise por "People API" e clique em **Ativar**

### 1.3 Configurar Tela de Consentimento OAuth

1. Vá em **APIs e Serviços** → **Tela de consentimento OAuth**
2. Escolha **Externo** se for uma aplicação pública
3. Preencha as informações obrigatórias:
   - **Nome do aplicativo**: ComenteDM
   - **Email de suporte do usuário**: seu@email.com
   - **Domínios autorizados**: 
     - `localhost` (para desenvolvimento)
     - `seu-dominio.com` (para produção)
   - **Email de contato do desenvolvedor**: seu@email.com

4. Na seção **Escopos**, adicione:
   - `email`
   - `profile`
   - `openid`

5. Clique em **Salvar e continuar**

### 1.4 Criar Credenciais OAuth

1. Vá em **APIs e Serviços** → **Credenciais**
2. Clique em **+ Criar credenciais** → **ID do cliente OAuth 2.0**
3. Selecione **Aplicação web**
4. Configure:
   - **Nome**: ComenteDM Web Client
   - **URIs de redirecionamento autorizados**:
     ```
     https://seu-projeto-id.supabase.co/auth/v1/callback
     http://localhost:54321/auth/v1/callback
     ```

5. Clique em **Criar**
6. **Copie o Client ID e Client Secret** - você vai precisar deles!

## 2. Configuração no Supabase

### 2.1 Acessar Configurações

1. Abra o [Dashboard do Supabase](https://app.supabase.com/)
2. Selecione seu projeto
3. Vá em **Authentication** → **Providers**

### 2.2 Configurar Google OAuth

1. Procure por **Google** na lista de providers
2. Ative o toggle **Enable sign in with Google**
3. Preencha:
   - **Client ID**: Cole o Client ID do Google Console
   - **Client Secret**: Cole o Client Secret do Google Console
4. Clique em **Save**

### 2.3 Configurar URLs de Redirect

1. Ainda em **Authentication**, vá para **URL Configuration**
2. Configure:
   - **Site URL**: `https://seu-dominio.com` (ou `http://localhost:3000` para dev)
   - **Redirect URLs**: 
     ```
     https://seu-dominio.com/campaigns
     http://localhost:3000/campaigns
     ```

## 3. Configuração no Código

O código já está configurado! As principais implementações incluem:

### 3.1 Botão de Login com Google
```tsx
// src/pages/AuthPage.tsx
const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/campaigns`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });
};
```

### 3.2 Ícone do Google
```tsx
// src/components/GoogleIcon.tsx
// Componente SVG com as cores oficiais do Google
```

### 3.3 Tratamento de Autenticação
```tsx
// src/providers/AuthProvider.tsx
// Já configurado para lidar com OAuth redirects
```

## 4. Testando a Configuração

### 4.1 Ambiente de Desenvolvimento
1. Execute `npm run dev`
2. Acesse `http://localhost:3000/auth`
3. Clique em "Continuar com Google"
4. Faça login com sua conta Google
5. Deve ser redirecionado para `/campaigns`

### 4.2 Ambiente de Produção
1. Deploy da aplicação
2. Configure as URLs corretas no Google Console
3. Teste o fluxo completo

## 5. Troubleshooting

### Erro: "OAuth não está configurado"
- Verifique se o Google provider está ativado no Supabase
- Confirme que Client ID e Secret estão corretos

### Erro: "redirect_uri_mismatch"
- Verifique se a URL de redirect no Google Console está correta
- Formato: `https://seu-projeto.supabase.co/auth/v1/callback`

### Erro: "popup bloqueado"
- Instrua usuários a permitir popups
- Considere usar redirect em vez de popup

### Login funciona mas não redireciona
- Verifique a configuração de Site URL no Supabase
- Confirme que a URL de redirect está correta

## 6. URLs Importantes

### Google Console
- **Console**: https://console.cloud.google.com/
- **OAuth Consent**: https://console.cloud.google.com/apis/credentials/consent
- **Credenciais**: https://console.cloud.google.com/apis/credentials

### Supabase
- **Dashboard**: https://app.supabase.com/
- **Auth Config**: Seu projeto → Authentication → Providers
- **URL Config**: Seu projeto → Authentication → URL Configuration

### Documentação
- **Supabase Google Auth**: https://supabase.com/docs/guides/auth/social-login/auth-google
- **Google OAuth 2.0**: https://developers.google.com/identity/protocols/oauth2

## 7. Configuração para Produção

### 7.1 Domínio Personalizado
1. Configure um domínio personalizado no Supabase
2. Atualize as URLs no Google Console
3. Configure SSL/HTTPS

### 7.2 Segurança
- Use HTTPS em produção
- Configure CORS adequadamente
- Monitore logs de autenticação

### 7.3 Experiência do Usuário
- Customize a tela de consentimento
- Configure logo e branding
- Teste em diferentes dispositivos

## 8. Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## 9. Próximos Passos

Após configurar o Google OAuth:

1. **Teste completamente** o fluxo de login
2. **Configure outros providers** (Facebook, GitHub, etc.)
3. **Implemente logout** adequado
4. **Configure perfis de usuário**
5. **Monitore métricas** de autenticação

---

**Dica**: Mantenha suas credenciais seguras e nunca as compartilhe publicamente!
