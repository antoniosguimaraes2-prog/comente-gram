import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

interface Subscription {
  plan_name: string;
  billing_cycle: 'monthly' | 'annual';
  started_at: string;
  expires_at: string;
  status: string;
}

interface Payment {
  id: string;
  plan_name: string;
  plan_price: number;
  status: string;
  created_at: string;
  approved_at?: string;
}

interface SubscriptionData {
  has_active_subscription: boolean;
  subscription: Subscription | null;
  recent_payments: Payment[];
}

export const useSubscription = () => {
  const { user, isInMVPMode } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: subscriptionData,
    isLoading,
    error,
    refetch
  } = useQuery<SubscriptionData>({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user || isInMVPMode) {
        return {
          has_active_subscription: true, // MVP mode always has access
          subscription: {
            plan_name: 'MVP',
            billing_cycle: 'monthly' as const,
            started_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
          },
          recent_payments: []
        };
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to check subscription');
      }

      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const invalidateSubscription = () => {
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
  };

  const hasActiveSubscription = subscriptionData?.has_active_subscription ?? false;
  const subscription = subscriptionData?.subscription;
  const recentPayments = subscriptionData?.recent_payments ?? [];

  // Helper functions
  const isPlanActive = (planName: string): boolean => {
    return hasActiveSubscription && subscription?.plan_name === planName;
  };

  const getSubscriptionStatus = (): 'active' | 'inactive' | 'expired' | 'mvp' => {
    if (isInMVPMode) return 'mvp';
    if (!hasActiveSubscription) return 'inactive';
    
    if (subscription?.expires_at) {
      const expiresAt = new Date(subscription.expires_at);
      const now = new Date();
      
      if (expiresAt < now) return 'expired';
    }
    
    return 'active';
  };

  const getDaysUntilExpiry = (): number | null => {
    if (!subscription?.expires_at) return null;
    
    const expiresAt = new Date(subscription.expires_at);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getLatestPayment = (): Payment | null => {
    return recentPayments.length > 0 ? recentPayments[0] : null;
  };

  return {
    // Data
    hasActiveSubscription,
    subscription,
    recentPayments,
    subscriptionStatus: getSubscriptionStatus(),
    daysUntilExpiry: getDaysUntilExpiry(),
    latestPayment: getLatestPayment(),
    
    // States
    isLoading,
    error,
    
    // Actions
    refetch,
    invalidateSubscription,
    
    // Helpers
    isPlanActive,
  };
};

export default useSubscription;
