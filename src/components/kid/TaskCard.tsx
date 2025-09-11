import { useState } from 'react';
import { CheckCircle, Circle, Coins } from 'lucide-react';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMutationWithToasts } from '@/hooks/use-mutation-toasts';
import { supabase } from '@/integrations/supabase/client';
import type { DailyTask } from '@/hooks/use-supabase-rpc';
import { useParams } from 'react-router-dom';
import { getWeekInfo } from '@/lib/date-utils';

interface TaskCardProps {
  task: DailyTask;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { kidId } = useParams<{ kidId: string }>();
  
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  const weekInfo = getWeekInfo(today);

  const completeTaskMutation = useMutationWithToasts(
    async ({ kidId, taskTemplateId }: { kidId: string; taskTemplateId: string }) => {
      const { data, error } = await supabase.rpc('complete_task_for_date' as any, {
        p_kid_id: kidId,
        p_task_template_id: taskTemplateId,
        p_date: todayISO,
      });
      
      if (error) throw error;
      return data as number; // Returns updated points balance
    },
    {
      success: { 
        title: "Task completed", 
        description: `+${task.task_template.base_points} points` 
      },
      error: { title: "Task completion failed" },
      invalidate: [
        ['tasks-for-date', kidId, todayISO],
        ['kid-balance', kidId],
        ['tasks-calendar', kidId, weekInfo.weekStartISO, weekInfo.weekEndISO]
      ],
      onSuccessExtra: () => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  );

  const isCompleted = task.status === 'done';
  const isPending = task.status === 'pending';

  const handleComplete = async () => {
    if (!kidId || !isPending) return;
    
    await completeTaskMutation.mutateAsync({
      kidId,
      taskTemplateId: task.task_template_id,
    });
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      
      <Card className={`p-4 transition-all duration-300 ${
        isCompleted 
          ? 'bg-kid-success/10 border-kid-success' 
          : 'bg-white hover:shadow-lg hover:scale-[1.02]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-3xl">{task.task_template.icon_emoji}</div>
            
            <div className="flex-1">
              <h3 className={`font-semibold text-lg ${
                isCompleted ? 'text-kid-success line-through' : 'text-gray-800'
              }`}>
                {task.task_template.title}
              </h3>
              
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-kid-warning">
                  <Coins className="h-4 w-4" />
                  <span className="font-medium">{task.task_template.base_points} pts</span>
                </div>
                
                {isCompleted && (
                  <span className="text-kid-success text-sm font-medium animate-bounce-in">
                    ✨ Completed!
                  </span>
                )}
              </div>
            </div>
          </div>

          {isPending && (
            <Button
              onClick={handleComplete}
              disabled={completeTaskMutation.isPending}
              size="lg"
              className="bg-kid-primary hover:bg-kid-primary/90 text-white active:scale-95 rounded-2xl min-w-[64px] h-16"
            >
              {completeTaskMutation.isPending ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
              ) : (
                <Circle className="h-8 w-8" />
              )}
            </Button>
          )}

          {isCompleted && (
            <div className="bg-kid-success text-white cursor-not-allowed rounded-2xl min-w-[64px] h-16 flex items-center justify-center">
              <CheckCircle className="h-8 w-8" />
            </div>
          )}
        </div>
      </Card>
    </>
  );
};