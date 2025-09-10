import { useParams } from 'react-router-dom';
import { Calendar, Trophy } from 'lucide-react';
import { KidHeader } from '@/components/kid/KidHeader';
import { TaskCard } from '@/components/kid/TaskCard';
import { NavigationButtons } from '@/components/kid/NavigationButtons';
import { BonusButton } from '@/components/kid/BonusButton';
import { TaskCardSkeleton, HeaderSkeleton } from '@/components/kid/LoadingSkeleton';
import { useKidTodayTasks, useKidInfo } from '@/hooks/use-supabase-rpc';

const KidDashboard = () => {
  const { kidId } = useParams<{ kidId: string }>();
  const { data: tasks, isLoading: tasksLoading } = useKidTodayTasks(kidId!);
  const { data: kidInfo, isLoading: kidLoading } = useKidInfo(kidId!);

  const isLoading = tasksLoading || kidLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-kid-fun/10 to-white pb-24">
        <HeaderSkeleton />
        
        <div className="p-4 space-y-4 max-w-md mx-auto">
          {[1, 2, 3].map((i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
        
        <NavigationButtons currentPage="dashboard" />
      </div>
    );
  }

  const completedTasks = tasks?.filter(task => task.status === 'done').length || 0;
  const totalTasks = tasks?.length || 0;
  const allTasksCompleted = totalTasks > 0 && completedTasks === totalTasks;

  return (
    <div className="min-h-screen bg-gradient-to-b from-kid-fun/10 to-white pb-24">
      <KidHeader kidName={kidInfo?.display_name || 'Loading...'} />
      
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Today's Date */}
        <div className="flex items-center gap-2 text-gray-600 justify-center">
          <Calendar className="h-5 w-5" />
          <span className="font-medium">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>

        {/* Bonus Buttons */}
        <div className="space-y-3">
          <BonusButton kidId={kidId!} period="daily" />
          <BonusButton kidId={kidId!} period="weekly" />
        </div>

        {/* Progress Indicator */}
        {totalTasks > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-kid-warning" />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  Today's Progress
                </p>
                <p className="text-sm text-gray-600">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(completedTasks / totalTasks) * 251.2} 251.2`}
                      className="text-kid-success transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-700">
                      {Math.round((completedTasks / totalTasks) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            📝 Today's Tasks
          </h2>
          
          {!tasks || tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No tasks for today!
              </h3>
              <p className="text-gray-500">
                Enjoy your free day!
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </div>

        {/* Encouraging Message */}
        {allTasksCompleted && totalTasks > 0 && (
          <div className="bg-gradient-to-r from-kid-success to-kid-secondary text-white p-6 rounded-2xl text-center animate-bounce-in">
            <div className="text-4xl mb-2">🌟</div>
            <h3 className="text-xl font-bold mb-1">All Done!</h3>
            <p className="text-sm opacity-90">
              You completed all your tasks today! You're amazing!
            </p>
          </div>
        )}
      </div>

      <NavigationButtons currentPage="dashboard" />
    </div>
  );
};

export default KidDashboard;