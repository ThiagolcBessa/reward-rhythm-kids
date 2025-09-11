import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { notifySuccess, notifyError, pgFriendlyMessage } from '@/lib/notify';
import { useFamily } from '@/hooks/use-parent-data';

export interface Assignment {
  id: string;
  kid_id: string;
  task_template_id: string;
  days_of_week: string[] | null;
  base_points_override: number | null;
  start_date: string;
  end_date: string | null;
  active: boolean;
  created_at: string;
  kid: {
    display_name: string;
  };
  task_template: {
    title: string;
    base_points: number;
  };
}

export interface CreateAssignmentData {
  kid_id: string;
  task_template_id: string;
  days_of_week?: string[] | null;
  base_points_override?: number | null;
  start_date: string;
  end_date?: string | null;
  active?: boolean;
}

export interface UpdateAssignmentData extends Partial<CreateAssignmentData> {
  id: string;
}

// Hook to get assignments
export const useAssignments = () => {
  const { data: family } = useFamily();
  
  return useQuery({
    queryKey: ['assignments-list', family?.id],
    queryFn: async () => {
      if (!family) return [];
      
      // Get assignments for this family
      const { data: assignmentsData, error: assignmentsError } = await supabase.rpc('get_family_assignments' as any, {
        family_id: family.id
      });
      
      if (assignmentsError) {
        // Fallback to direct query if RPC doesn't exist
        const { data: rawAssignments, error } = await supabase
          .from('kid_task_assignment' as any)
          .select('*');
        
        if (error) throw error;
        
        // Get kids and task templates to join data
        const { data: kidsData } = await supabase
          .from('kid')
          .select('id, display_name, family_id')
          .eq('family_id', family.id);
          
        const { data: templatesData } = await supabase
          .from('task_template')
          .select('id, title, base_points, family_id')
          .eq('family_id', family.id);
        
        if (!rawAssignments || !kidsData || !templatesData) return [];
        
        // Filter and join data
        const familyKidIds = kidsData.map((k: any) => k.id);
        const filteredAssignments = rawAssignments.filter((a: any) => familyKidIds.includes(a.kid_id));
        
        return filteredAssignments.map((assignment: any) => ({
          ...assignment,
          kid: kidsData.find((k: any) => k.id === assignment.kid_id) || { display_name: 'Unknown' },
          task_template: templatesData.find((t: any) => t.id === assignment.task_template_id) || { title: 'Unknown', base_points: 0 },
        })) as Assignment[];
      }
      
      return assignmentsData as Assignment[];
    },
    enabled: !!family,
  });
};

// Hook to create assignment
export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  const { data: family } = useFamily();
  
  return useMutation({
    mutationFn: async (assignmentData: CreateAssignmentData) => {
      const { data, error } = await supabase
        .from('kid_task_assignment' as any)
        .insert(assignmentData as any)
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (family?.id) {
        queryClient.invalidateQueries({ queryKey: ['assignments-list', family.id] });
      }
      notifySuccess("Assignment created!", "Task has been assigned successfully.");
    },
    onError: (error: any) => {
      // Handle unique constraint violation (duplicate assignment)
      if (error.code === '23505') {
        notifyError("Assignment already exists", "This task is already assigned to this kid.");
        // Emit custom event to focus the Task Template field
        window.dispatchEvent(new CustomEvent('focus-task-template'));
        return;
      }
      
      notifyError("Error creating assignment", pgFriendlyMessage(error));
    },
  });
};

// Hook to update assignment
export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  const { data: family } = useFamily();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateAssignmentData) => {
      const { data, error } = await supabase
        .from('kid_task_assignment' as any)
        .update(updateData as any)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (family?.id) {
        queryClient.invalidateQueries({ queryKey: ['assignments-list', family.id] });
      }
      notifySuccess("Assignment updated!", "Changes have been saved successfully.");
    },
    onError: (error: any) => {
      // Handle unique constraint violation (duplicate assignment)
      if (error.code === '23505') {
        notifyError("Assignment already exists", "This task is already assigned to this kid.");
        // Emit custom event to focus the Task Template field
        window.dispatchEvent(new CustomEvent('focus-task-template'));
        return;
      }
      
      notifyError("Error updating assignment", pgFriendlyMessage(error));
    },
  });
};

// Hook to delete assignment
export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  
  const { data: family } = useFamily();
  
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('kid_task_assignment' as any)
        .delete()
        .eq('id', assignmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      if (family?.id) {
        queryClient.invalidateQueries({ queryKey: ['assignments-list', family.id] });
      }
      notifySuccess("Assignment deleted", "Task assignment has been removed.");
    },
    onError: (error: any) => {
      notifyError("Error deleting assignment", pgFriendlyMessage(error));
    },
  });
};