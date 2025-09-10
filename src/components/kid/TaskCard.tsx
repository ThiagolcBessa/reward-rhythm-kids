import { useState } from 'react';
import { CheckCircle, Circle, Coins } from 'lucide-react';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCompleteTask } from '@/hooks/use-supabase-rpc';
import type { DailyTask } from '@/hooks/use-supabase-rpc';

interface TaskCardProps {
  task: DailyTask;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  const completeTaskMutation = useCompleteTask();

  const isCompleted = task.status === 'done';

  const handleComplete = async () => {
    try {
      const newBalance = await completeTaskMutation.mutateAsync(task.id);
      
      // Show confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      // Success toast
      toast({
        title: "🎉 Amazing job!",
        description: `You earned ${task.task_template.base_points} points! New balance: ${newBalance} points`,
        duration: 4000,
      });
    } catch (error) {
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again!",
        variant: "destructive",
      });
    }
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

          <Button
            onClick={handleComplete}
            disabled={isCompleted || completeTaskMutation.isPending}
            size="lg"
            className={`rounded-2xl min-w-[64px] h-16 ${
              isCompleted
                ? 'bg-kid-success text-white cursor-not-allowed'
                : 'bg-kid-primary hover:bg-kid-primary/90 text-white active:scale-95'
            }`}
          >
            {completeTaskMutation.isPending ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            ) : isCompleted ? (
              <CheckCircle className="h-8 w-8" />
            ) : (
              <Circle className="h-8 w-8" />
            )}
          </Button>
        </div>
      </Card>
    </>
  );
};