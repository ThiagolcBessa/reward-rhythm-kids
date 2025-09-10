import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook to get kid information
export const useKidInfo = (kidId: string) => {
  return useQuery({
    queryKey: ['kid-info', kidId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kid')
        .select('display_name, age, color_hex')
        .eq('id', kidId)
        .single();
      
      if (error) throw error;
      return data as { display_name: string; age: number | null; color_hex: string | null };
    },
  });
};

// Types for our RPC functions
export interface DailyTask {
  id: string;
  kid_id: string;
  task_template_id: string;
  due_date: string;
  status: string;
  points_awarded: number | null;
  task_template: {
    title: string;
    icon_emoji: string;
    base_points: number;
  };
}

export interface Reward {
  id: string;
  family_id: string;
  title: string;
  cost_points: number;
  description: string | null;
  active: boolean;
  icon_emoji: string;
}

export interface PointsLedgerEntry {
  id: string;
  kid_id: string;
  entry_type: 'credit' | 'debit' | 'bonus';
  points: number;
  description: string;
  created_at: string;
}

// Hook to get kid's balance
export const useKidBalance = (kidId: string) => {
  return useQuery({
    queryKey: ['kid-balance', kidId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_kid_balance', {
        p_kid_id: kidId,
      });
      
      if (error) throw error;
      return data as number;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Hook to get today's tasks for a kid
export const useKidTodayTasks = (kidId: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['kid-today-tasks', kidId, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_task')
        .select(`
          *,
          task_template (
            title,
            icon_emoji,
            base_points
          )
        `)
        .eq('kid_id', kidId)
        .eq('due_date', today)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as DailyTask[];
    },
  });
};

// Hook to get active rewards for kid's family
export const useKidRewards = (kidId: string) => {
  return useQuery({
    queryKey: ['kid-rewards', kidId],
    queryFn: async () => {
      // First get the kid's family_id
      const { data: kidData, error: kidError } = await supabase
        .from('kid')
        .select('family_id')
        .eq('id', kidId)
        .single();
      
      if (kidError) throw kidError;
      
      // Then get active rewards for that family
      const { data, error } = await supabase
        .from('reward')
        .select('*')
        .eq('family_id', kidData.family_id)
        .eq('active', true)
        .order('cost_points', { ascending: true });
      
      if (error) throw error;
      return data as Reward[];
    },
  });
};

// Hook to get kid's points history
export const useKidPointsHistory = (kidId: string) => {
  return useQuery({
    queryKey: ['kid-points-history', kidId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_ledger')
        .select('*')
        .eq('kid_id', kidId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as PointsLedgerEntry[];
    },
  });
};

// Mutation to complete a task
export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dailyTaskId: string) => {
      const { data, error } = await supabase.rpc('complete_task', {
        p_daily_task_id: dailyTaskId,
      });
      
      if (error) throw error;
      return data as number; // Returns updated points balance
    },
    onSuccess: (_, dailyTaskId) => {
      // Get the task to find the kid_id
      queryClient.invalidateQueries({ queryKey: ['kid-today-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['kid-balance'] });
      queryClient.invalidateQueries({ queryKey: ['kid-points-history'] });
    },
  });
};

// Mutation to redeem a reward
export const useRedeemReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ kidId, rewardId }: { kidId: string; rewardId: string }) => {
      const { data, error } = await supabase.rpc('redeem_reward', {
        p_kid_id: kidId,
        p_reward_id: rewardId,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { kidId }) => {
      queryClient.invalidateQueries({ queryKey: ['kid-balance', kidId] });
      queryClient.invalidateQueries({ queryKey: ['kid-points-history', kidId] });
    },
  });
};

// Mutation to grant bonus
export const useGrantBonus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ kidId, period }: { kidId: string; period: 'daily' | 'weekly' }) => {
      const { data, error } = await supabase.rpc('grant_bonus', {
        p_kid_id: kidId,
        p_period: period,
      });
      
      if (error) throw error;
      return data as number; // Returns updated balance
    },
    onSuccess: (_, { kidId }) => {
      queryClient.invalidateQueries({ queryKey: ['kid-balance', kidId] });
      queryClient.invalidateQueries({ queryKey: ['kid-points-history', kidId] });
    },
  });
};

// Hook to check bonus eligibility
export const useBonusEligibility = (kidId: string, period: 'daily' | 'weekly') => {
  return useQuery({
    queryKey: ['bonus-eligibility', kidId, period],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_bonus_eligibility', {
        p_kid_id: kidId,
        p_period: period,
      });
      
      if (error) throw error;
      return data as {
        period: string;
        total_tasks: number;
        completed_tasks: number;
        eligible: boolean;
        already_granted: boolean;
        bonus_points: number;
      };
    },
    refetchInterval: 60000, // Check every minute
  });
};