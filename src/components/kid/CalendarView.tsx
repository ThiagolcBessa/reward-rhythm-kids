import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMutationWithToasts } from '@/hooks/use-mutation-toasts';
import { useKidTasksCalendar } from '@/hooks/use-supabase-rpc';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import Confetti from 'react-confetti';
import { getWeekInfo, getNextWeek, getPreviousWeek, formatCalendarHeader, getWeekDays } from '@/lib/date-utils';

interface CalendarViewProps {
  kidId?: string; // Optional for parent view
  viewType: 'kid' | 'parent';
}

interface TaskItem {
  due_date: string;
  task_template_id: string;
  title: string;
  icon_emoji: string;
  base_points: number;
  status: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ kidId: propKidId, viewType }) => {
  const { kidId: paramKidId } = useParams<{ kidId: string }>();
  const kidId = propKidId || paramKidId!;
  
  const [currentWeek, setCurrentWeek] = useState(() => getWeekInfo(new Date()));
  const [showConfetti, setShowConfetti] = useState(false);
  
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  const completeTaskMutation = useMutationWithToasts(
    async ({ kidId, taskTemplateId, taskPoints }: { kidId: string; taskTemplateId: string; taskPoints: number }) => {
      const { data, error } = await supabase.rpc('complete_task_for_date' as any, {
        p_kid_id: kidId,
        p_task_template_id: taskTemplateId,
        p_date: todayISO,
      });
      
      if (error) throw error;
      return { balance: data as number, points: taskPoints };
    },
    {
      success: (data) => ({ 
        title: "Task completed", 
        description: `+${data.points} points`
      }),
      error: { title: "Task completion failed" },
      invalidate: [
        ['tasks-for-date', kidId, todayISO],
        ['kid-balance', kidId],
        ['tasks-calendar', kidId, currentWeek.weekStartISO, currentWeek.weekEndISO]
      ],
      onSuccessExtra: (data) => {
        // Show confetti
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  );

  // Get week days using utility
  const weekDays = getWeekDays(currentWeek.weekStart);

  const { data: tasks, isLoading } = useKidTasksCalendar(kidId, currentWeek.weekStartISO, currentWeek.weekEndISO);

  // Group tasks by date
  const tasksByDate = tasks?.reduce((acc, task) => {
    if (!acc[task.due_date]) acc[task.due_date] = [];
    acc[task.due_date].push(task);
    return acc;
  }, {} as Record<string, TaskItem[]>) || {};

  const handlePreviousWeek = () => {
    setCurrentWeek(getPreviousWeek(currentWeek.weekStart));
  };

  const handleNextWeek = () => {
    setCurrentWeek(getNextWeek(currentWeek.weekStart));
  };

  const handleCompleteTask = async (task: TaskItem) => {
    const today = new Date().toISOString().split('T')[0];
    if (viewType !== 'kid' || task.status !== 'pending' || task.due_date !== today) {
      return;
    }

    await completeTaskMutation.mutateAsync({
      kidId,
      taskTemplateId: task.task_template_id,
      taskPoints: task.base_points,
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

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

      <div className="p-4 space-y-4">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousWeek}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <h2 className="text-lg font-semibold text-center">
            {formatCalendarHeader(currentWeek.weekStart)} - {formatCalendarHeader(currentWeek.weekEnd)}
          </h2>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayTasks = tasksByDate[dateStr] || [];
            const today = new Date().toISOString().split('T')[0];
            const isCurrentDay = dateStr === today;

            return (
              <Card
                key={dateStr}
                className={`p-3 h-auto min-h-[120px] ${
                  isCurrentDay ? 'ring-2 ring-kid-primary bg-kid-primary/5' : ''
                }`}
              >
                {/* Day Header */}
                <div className="text-center mb-3">
                  <div className="text-xs font-medium text-gray-500 uppercase">
                    {formatCalendarHeader(day).split(' ')[0]}
                  </div>
                  <div className={`text-lg font-semibold ${
                    isCurrentDay ? 'text-kid-primary' : 'text-gray-700'
                  }`}>
                    {formatCalendarHeader(day).split(' ')[1]}
                  </div>
                  {isCurrentDay && (
                    <Badge variant="default" className="text-xs bg-kid-primary">
                      Today
                    </Badge>
                  )}
                </div>

                {/* Tasks List */}
                <div className="space-y-2">
                  {dayTasks.length === 0 ? (
                    <div className="text-center text-gray-400 text-xs py-2">
                      No tasks
                    </div>
                  ) : (
                    dayTasks.map((task, index) => {
                      const isCompleted = task.status === 'done';
                      const isPending = task.status === 'pending';
                      const canComplete = viewType === 'kid' && isPending && isCurrentDay;

                      return (
                        <div
                          key={`${task.task_template_id}-${index}`}
                          className={`text-xs p-2 rounded-lg border transition-all ${
                            isCompleted
                              ? 'bg-kid-success/10 border-kid-success/20 text-kid-success'
                              : 'bg-gray-50 border-gray-200 hover:border-kid-primary/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-start gap-1 flex-1 min-w-0">
                              <span className="text-sm flex-shrink-0">
                                {task.icon_emoji}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className={`font-medium leading-tight ${
                                  isCompleted ? 'line-through' : ''
                                }`}>
                                  {task.title}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Coins className="h-3 w-3 text-kid-warning" />
                                  <span className="text-xs text-kid-warning font-medium">
                                    {task.base_points}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {canComplete && (
                              <Button
                                size="sm"
                                onClick={() => handleCompleteTask(task)}
                                disabled={completeTaskMutation.isPending}
                                className="h-6 w-6 p-0 bg-kid-primary hover:bg-kid-primary/90 flex-shrink-0"
                              >
                                {completeTaskMutation.isPending ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent" />
                                ) : (
                                  <Circle className="h-3 w-3" />
                                )}
                              </Button>
                            )}

                            {isCompleted && (
                              <CheckCircle className="h-4 w-4 text-kid-success flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Week Summary for Kid View */}
        {viewType === 'kid' && (
          <Card className="p-4 bg-gradient-to-r from-kid-primary/5 to-kid-secondary/5">
            <div className="text-center">
              <h3 className="font-semibold text-gray-700 mb-2">This Week's Progress</h3>
              <div className="flex justify-center items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-kid-success" />
                  <span>
                    {Object.values(tasksByDate).flat().filter(t => t.status === 'done').length} Completed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-gray-400" />
                  <span>
                    {Object.values(tasksByDate).flat().filter(t => t.status === 'pending').length} Pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-kid-warning" />
                  <span>
                    {Object.values(tasksByDate).flat()
                      .filter(t => t.status === 'done')
                      .reduce((sum, t) => sum + t.base_points, 0)} Points Earned
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};

export { CalendarView };