import { supabase } from "@/integrations/supabase/client";

export interface ConfigStatus {
  isConfigured: boolean;
  hasCredentials: boolean;
  hasValidCallback: boolean;
  errors: string[];
}

export const checkInstagramConfig = async (): Promise<ConfigStatus> => {
  const errors: string[] = [];
  let hasCredentials = false;
  let hasValidCallback = false;

  try {
    // Test if the Instagram OAuth start function is working
    const { data, error } = await supabase.functions.invoke("instagram-oauth-start", {
      headers: {
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    });

    if (error) {
      if (error.message?.includes('META_APP_ID not configured')) {
        errors.push('META_APP_ID não está configurado nas variáveis de ambiente');
      } else if (error.message?.includes('META_APP_SECRET')) {
        errors.push('META_APP_SECRET não está configurado nas variáveis de ambiente');
      } else {
        errors.push(`Erro na configuração: ${error.message}`);
      }
    } else {
      hasCredentials = true;
      
      // Check if we got a valid auth URL
      if (data?.authUrl) {
        hasValidCallback = true;
      } else {
        errors.push('URL de autorização não foi gerada corretamente');
      }
    }
  } catch (err: any) {
    errors.push(`Erro ao verificar configuração: ${err.message}`);
  }

  return {
    isConfigured: hasCredentials && hasValidCallback && errors.length === 0,
    hasCredentials,
    hasValidCallback,
    errors
  };
};

export const getConfigInstructions = (): string[] => {
  return [
    "1. Crie um app no Meta for Developers (developers.facebook.com)",
    "2. Configure o produto 'Instagram Basic Display'",
    "3. Obtenha o APP_ID e APP_SECRET",
    "4. Configure as variáveis no Supabase:",
    "   - META_APP_ID=seu_app_id",
    "   - META_APP_SECRET=seu_app_secret",
    "5. Configure os URIs de redirecionamento no Meta",
    "6. Teste a conexão na página 'Conectar Instagram'"
  ];
};

export const getRequiredPermissions = (): string[] => {
  return [
    "instagram_manage_messages - Para enviar DMs",
    "instagram_manage_comments - Para ler comentários", 
    "pages_show_list - Para listar páginas do Facebook",
    "pages_manage_metadata - Para gerenciar metadados das páginas"
  ];
};

export const validateInstagramAccount = (account: any): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];

  if (!account) {
    issues.push("Nenhuma conta conectada");
    return { isValid: false, issues };
  }

  if (!account.page_id) {
    issues.push("Page ID não encontrado");
  }

  if (!account.ig_business_id) {
    issues.push("Instagram Business ID não encontrado");
  }

  if (!account.access_token_encrypted) {
    issues.push("Token de acesso não encontrado");
  }

  // Check if the account was connected recently (last 60 days)
  const connectedAt = new Date(account.connected_at);
  const daysSinceConnection = Math.floor((Date.now() - connectedAt.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceConnection > 60) {
    issues.push(`Token pode estar expirado (conectado há ${daysSinceConnection} dias)`);
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};
