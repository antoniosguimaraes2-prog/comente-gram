import { useState, useEffect } from 'react';
import { getAuthProviders, getSupabaseOAuthConfig, AuthProvider } from '@/lib/auth-config';

export const useAuthConfig = () => {
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseConfig, setSupabaseConfig] = useState<ReturnType<typeof getSupabaseOAuthConfig>>(null);

  useEffect(() => {
    const checkProviders = async () => {
      try {
        setLoading(true);
        const authProviders = await getAuthProviders();
        setProviders(authProviders);
        setSupabaseConfig(getSupabaseOAuthConfig());
      } catch (error) {
        console.error('Error checking auth providers:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProviders();
  }, []);

  const googleProvider = providers.find(p => p.name === 'Google');
  const isGoogleConfigured = googleProvider?.configured ?? false;

  const refreshConfig = async () => {
    setLoading(true);
    try {
      const authProviders = await getAuthProviders();
      setProviders(authProviders);
    } catch (error) {
      console.error('Error refreshing auth config:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    providers,
    loading,
    isGoogleConfigured,
    supabaseConfig,
    refreshConfig
  };
};

export default useAuthConfig;
