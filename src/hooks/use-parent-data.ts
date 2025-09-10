import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Types for parent dashboard
export interface Family {
  id: string;
  name: string;
  owner_uid: string;
  created_at: string;
}

export interface Kid {
  id: string;
  family_id: string;
  display_name: string;
  age: number | null;
  avatar_url: string | null;
  color_hex: string | null;
  created_at: string;
}

export interface TaskTemplate {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  icon_emoji: string | null;
  base_points: number;
  recurrence: 'daily' | 'weekly' | 'once';
  active: boolean;
  created_at: string;
}

export interface Reward {
  id: string;
  family_id: string;
  title: string;
  cost_points: number;
  description: string | null;
  icon_emoji: string | null;
  active: boolean;
  created_at: string;
}

export interface RedemptionWithDetails {
  id: string;
  kid_id: string;
  reward_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  requested_at: string;
  decided_at: string | null;
  decided_by: string | null;
  notes: string | null;
  kid: {
    display_name: string;
  };
  reward: {
    title: string;
    cost_points: number;
    icon_emoji: string | null;
  };
}

// Hook to get or create family for current user
export const useFamily = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['family', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // First try to get existing family
      const { data: existingFamily, error: fetchError } = await supabase
        .from('family')
        .select('*')
        .eq('owner_uid', user.id)
        .single();
      
      if (existingFamily) {
        return existingFamily as Family;
      }
      
      // If no family exists, create one
      if (fetchError?.code === 'PGRST116') {
        const { data: newFamily, error: createError } = await supabase
          .from('family')
          .insert({
            name: 'My Family',
            owner_uid: user.id,
          })
          .select()
          .single();
        
        if (createError) throw createError;
        return newFamily as Family;
      }
      
      throw fetchError;
    },
    enabled: !!user,
  });
};

// Hook to get kids from authenticated user's family (for landing page)
export const useMyKids = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-kids', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First get the user's family
      const { data: family, error: familyError } = await supabase
        .from('family')
        .select('id')
        .eq('owner_uid', user.id)
        .single();
      
      if (familyError || !family) return [];
      
      // Then get kids from that family
      const { data, error } = await supabase
        .from('kid')
        .select('*')
        .eq('family_id', family.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Kid[];
    },
    enabled: !!user,
  });
};

// Hook to get kids
export const useKids = () => {
  const { data: family } = useFamily();
  
  return useQuery({
    queryKey: ['kids', family?.id],
    queryFn: async () => {
      if (!family) return [];
      
      const { data, error } = await supabase
        .from('kid')
        .select('*')
        .eq('family_id', family.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Kid[];
    },
    enabled: !!family,
  });
};

// Hook to get task templates
export const useTaskTemplates = () => {
  const { data: family } = useFamily();
  
  return useQuery({
    queryKey: ['task-templates', family?.id],
    queryFn: async () => {
      if (!family) return [];
      
      const { data, error } = await supabase
        .from('task_template')
        .select('*')
        .eq('family_id', family.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TaskTemplate[];
    },
    enabled: !!family,
  });
};

// Hook to get rewards
export const useRewards = () => {
  const { data: family } = useFamily();
  
  return useQuery({
    queryKey: ['rewards', family?.id],
    queryFn: async () => {
      if (!family) return [];
      
      const { data, error } = await supabase
        .from('reward')
        .select('*')
        .eq('family_id', family.id)
        .order('cost_points', { ascending: true });
      
      if (error) throw error;
      return data as Reward[];
    },
    enabled: !!family,
  });
};

// Hook to get redemptions
export const useRedemptions = () => {
  const { data: family } = useFamily();
  
  return useQuery({
    queryKey: ['redemptions', family?.id],
    queryFn: async () => {
      if (!family) return [];
      
      const { data, error } = await supabase
        .from('redemption')
        .select(`
          *,
          kid:kid_id (display_name),
          reward:reward_id (title, cost_points, icon_emoji)
        `)
        .eq('kid.family_id', family.id)
        .order('requested_at', { ascending: false });
      
      if (error) throw error;
      return data as RedemptionWithDetails[];
    },
    enabled: !!family,
  });
};

// Mutation to generate today's tasks
export const useGenerateTodayTasks = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: family } = useFamily();
  
  return useMutation({
    mutationFn: async () => {
      if (!family) throw new Error('No family found');
      
      const { data, error } = await supabase.rpc('generate_today_tasks', {
        p_family_id: family.id,
      });
      
      if (error) throw error;
      return data as number;
    },
    onSuccess: (taskCount) => {
      queryClient.invalidateQueries({ queryKey: ['kids'] });
      toast({
        title: "Tasks generated!",
        description: `Generated ${taskCount} tasks for today.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error generating tasks",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Mutation to decide redemption
export const useDecideRedemption = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ redemptionId, decision }: { 
      redemptionId: string; 
      decision: 'approved' | 'rejected' | 'delivered' 
    }) => {
      const { data, error } = await supabase.rpc('decide_redemption', {
        p_redemption_id: redemptionId,
        p_decision: decision,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { decision }) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['kids'] });
      
      const messages = {
        approved: "Reward approved! 🎉",
        rejected: "Redemption rejected",
        delivered: "Reward marked as delivered! ✅"
      };
      
      toast({
        title: messages[decision],
        description: decision === 'approved' ? "Points have been deducted" : "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error processing redemption",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};