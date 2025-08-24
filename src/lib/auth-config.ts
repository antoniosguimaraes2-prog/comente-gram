import { supabase } from "@/integrations/supabase/client";

export interface AuthProvider {
  name: string;
  enabled: boolean;
  configured: boolean;
}

/**
 * Check if Google OAuth is properly configured in Supabase
 */
export const checkGoogleOAuthConfig = async (): Promise<boolean> => {
  try {
    // Try to initiate OAuth without actually redirecting
    // This will fail if Google OAuth is not configured
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: true // This prevents actual redirect
      }
    });

    // If we get an error about missing configuration, return false
    if (error && (
      error.message.includes('OAuth') || 
      error.message.includes('provider') ||
      error.message.includes('not configured')
    )) {
      return false;
    }

    // If we get a URL back, it means OAuth is configured
    return !!(data?.url);
  } catch (error) {
    console.warn('Error checking Google OAuth config:', error);
    return false;
  }
};

/**
 * Get the list of available auth providers and their status
 */
export const getAuthProviders = async (): Promise<AuthProvider[]> => {
  const providers: AuthProvider[] = [
    {
      name: 'Google',
      enabled: true,
      configured: await checkGoogleOAuthConfig()
    }
    // Add more providers here as needed
    // {
    //   name: 'Facebook',
    //   enabled: false,
    //   configured: false
    // }
  ];

  return providers;
};

/**
 * Get Supabase project configuration info for OAuth setup
 */
export const getSupabaseOAuthConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  if (!supabaseUrl) {
    return null;
  }

  // Extract project ID from Supabase URL
  const projectId = supabaseUrl.split('//')[1]?.split('.')[0];
  
  return {
    projectId,
    callbackUrl: `${supabaseUrl}/auth/v1/callback`,
    dashboardUrl: `https://app.supabase.com/project/${projectId}/auth/providers`,
    redirectUrls: [
      `${window.location.origin}/campaigns`,
      'http://localhost:3000/campaigns'
    ]
  };
};

/**
 * Generate Google Console OAuth configuration instructions
 */
export const getGoogleConsoleInstructions = () => {
  const config = getSupabaseOAuthConfig();
  
  if (!config) {
    return null;
  }

  return {
    redirectUri: config.callbackUrl,
    authorizedDomains: [
      window.location.hostname,
      'localhost'
    ],
    scopes: ['email', 'profile', 'openid'],
    consoleUrl: 'https://console.cloud.google.com/apis/credentials'
  };
};
