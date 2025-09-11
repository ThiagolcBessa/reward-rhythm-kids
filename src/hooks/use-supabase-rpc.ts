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
        .maybeSingle();
      
      if (error) throw error;
      return data as { display_name: string; age: number | null; color_hex: string | null } | null;
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

// Type for get_today_tasks RPC response
interface TodayTaskRpcResponse {
  daily_task_id: string;
  status: string;
  points_awarded: number | null;
  title: string;
  icon_emoji: string;
  base_points: number;
  due_date: string;
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

// Hook to get today's tasks for a kid using get_tasks_for_date RPC
export const useKidTodayTasks = (kidId: string) => {
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  return useQuery({
    queryKey: ['tasks-for-date', kidId, today],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_tasks_for_date' as any, {
        p_kid_id: kidId,
        p_date: today,
      });
      
      if (error) throw error;
      
      // Transform RPC response to match expected UI shape
      const rpcData = data as unknown as Array<{
        task_template_id: string;
        title: string;
        icon_emoji: string;
        base_points: number;
        daily_task_id: string | null;
        status: string;
        points_awarded: number | null;
      }>;
      
      const transformedData = rpcData.map(task => ({
        id: task.daily_task_id || `pending-${task.task_template_id}`,
        kid_id: kidId,
        task_template_id: task.task_template_id,
        due_date: today,
        status: task.status || 'pending',
        points_awarded: task.points_awarded,
        task_template: {
          title: task.title,
          icon_emoji: task.icon_emoji,
          base_points: task.base_points,
        },
      })) as DailyTask[];
      
      return transformedData;
    },
    refetchOnWindowFocus: false,
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
        .maybeSingle();
      
      if (kidError) throw kidError;
      if (!kidData) return [];
      
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

// Mutation to complete a task using complete_task_for_date
export const useCompleteTaskForDate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ kidId, taskTemplateId }: { kidId: string; taskTemplateId: string }) => {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      const { data, error } = await supabase.rpc('complete_task_for_date' as any, {
        p_kid_id: kidId,
        p_task_template_id: taskTemplateId,
        p_date: today,
      });
      
      if (error) throw error;
      return data as number; // Returns updated points balance
    },
    onSuccess: (newBalance, { kidId }) => {
      const today = new Date().toISOString().split('T')[0];
      
      // Refetch the specific queries as requested
      queryClient.invalidateQueries({ queryKey: ['tasks-for-date', kidId, today] });
      queryClient.invalidateQueries({ queryKey: ['kid-balance', kidId] });
      queryClient.invalidateQueries({ queryKey: ['kid-points-history', kidId] });
      
      return newBalance;
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
    onSuccess: (_, { kidId, period }) => {
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['tasks-for-date', kidId, today] });
      queryClient.invalidateQueries({ queryKey: ['kid-balance', kidId] });
      queryClient.invalidateQueries({ queryKey: ['kid-points-history', kidId] });
      queryClient.invalidateQueries({ queryKey: ['bonus-eligibility', kidId, period] });
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