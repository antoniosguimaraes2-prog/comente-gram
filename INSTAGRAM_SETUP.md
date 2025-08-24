# 🔐 Configuração do Login Instagram

Este guia explica como configurar a autenticação com Instagram para o sistema de automação de DMs.

## 📋 Pré-requisitos

1. **Conta Instagram Business** (não pessoal)
2. **Página do Facebook** vinculada ao Instagram
3. **Conta Meta for Developers**
4. **Acesso ao Supabase Dashboard**

## 🚀 Passo a Passo

### 1. Criar App no Meta for Developers

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Clique em **"Criar App"**
3. Escolha **"Consumidor"** como tipo de app
4. Preencha as informações básicas:
   - Nome do app: "ComenteDM" (ou seu nome preferido)
   - Email de contato
   - Finalidade do app: "Automação de DMs Instagram"

### 2. Configurar Produtos do App

#### Instagram Basic Display
1. No dashboard do app, clique em **"Adicionar Produto"**
2. Selecione **"Instagram Basic Display"**
3. Clique em **"Configurar"**

#### Facebook Login
1. Adicione também **"Facebook Login"**
2. Configure conforme necessário

### 3. Configurar Instagram Basic Display

1. Vá para **"Instagram Basic Display" → "Configurações Básicas"**
2. Adicione **URIs de Redirecionamento OAuth Válidos**:
   ```
   https://seu-dominio.com/api/auth/instagram/callback
   ```
   ⚠️ **Importante**: Substitua `seu-dominio.com` pelo domínio real do seu app

3. Adicione **URIs de Desautorização**:
   ```
   https://seu-dominio.com/api/auth/instagram/logout
   ```

4. Adicione **URIs de Exclusão de Dados**:
   ```
   https://seu-dominio.com/api/auth/instagram/delete
   ```

### 4. Obter Credenciais

1. Na seção **"Configurações Básicas"** do app:
   - Copie o **ID do App** (META_APP_ID)
   - Copie o **Chave Secreta do App** (META_APP_SECRET)

### 5. Configurar Variáveis de Ambiente no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **"Configurações" → "Variáveis de Ambiente"**
3. Adicione as seguintes variáveis:

```env
META_APP_ID=seu_app_id_aqui
META_APP_SECRET=sua_chave_secreta_aqui
```

### 6. Configurar Permissões do App

No dashboard do Meta, configure as seguintes permissões:

#### Permissões Básicas:
- `instagram_manage_messages` - Para enviar DMs
- `instagram_manage_comments` - Para ler comentários
- `pages_show_list` - Para listar páginas
- `pages_manage_metadata` - Para gerenciar páginas

#### Para Modo de Produção:
1. Submeta o app para revisão do Meta
2. Forneça justificativas para cada permissão
3. Aguarde aprovação (pode levar alguns dias)

### 7. Testar a Configuração

1. Acesse a página **"Conectar Instagram"** no seu app
2. Clique em **"Conectar Instagram"**
3. Autorize as permissões solicitadas
4. Verifique se a conexão foi bem-sucedida

## 🔍 Troubleshooting

### Erro: "META_APP_ID not configured"
- Verifique se as variáveis de ambiente estão configuradas no Supabase
- Certifique-se de que os nomes das variáveis estão corretos

### Erro: "Authorization code not received"
- Verifique se o URI de redirecionamento está correto
- Confirme se o domínio está configurado no Meta

### Erro: "No Instagram Business account found"
- Certifique-se de que sua conta Instagram é do tipo Business
- Verifique se o Instagram está vinculado a uma Página do Facebook
- Confirme se você é administrador da Página

### Erro: "Invalid auth token"
- Verifique se o usuário está logado no sistema
- Confirme se a sessão do Supabase está válida

## 🔗 Links Úteis

- [Meta for Developers](https://developers.facebook.com)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Instagram Business Account Setup](https://business.instagram.com/getting-started)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## 📞 Suporte

Se precisar de ajuda adicional:
1. Verifique a documentação oficial do Meta
2. Consulte os logs do Supabase Edge Functions
3. Entre em contato com o suporte técnico

---

**Nota**: Este sistema requer aprovação do Meta para uso em produção. Durante o desenvolvimento, você pode usar o "Modo de Desenvolvimento" que permite testar com contas limitadas.
