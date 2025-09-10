import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useKids, useGenerateTodayTasks } from '@/hooks/use-parent-data';
import { useKidBalance, useKidTodayTasks } from '@/hooks/use-supabase-rpc';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, Star, Calendar, TrendingUp, CheckCircle, Clock, Users } from 'lucide-react';

interface KidOverviewCardProps {
  kid: {
    id: string;
    display_name: string;
    color_hex: string | null;
    age: number | null;
  };
}

const KidOverviewCard = ({ kid }: KidOverviewCardProps) => {
  const { data: balance, isLoading: balanceLoading } = useKidBalance(kid.id);
  const { data: tasks, isLoading: tasksLoading } = useKidTodayTasks(kid.id);
  
  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
  const totalTasks = tasks?.length || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  if (balanceLoading || tasksLoading) {
    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 hover:scale-[1.02]" 
          style={{ borderLeftColor: kid.color_hex || '#3B82F6' }}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-md" 
              style={{ backgroundColor: kid.color_hex || '#3B82F6' }}
            >
              {kid.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-lg">{kid.display_name}</h3>
              {kid.age && (
                <p className="text-sm text-muted-foreground">{kid.age} years old</p>
              )}
            </div>
          </div>
          <Badge 
            variant={completionRate === 100 && totalTasks > 0 ? "default" : completionRate >= 50 ? "secondary" : "outline"}
            className={completionRate === 100 && totalTasks > 0 ? "bg-fun-green text-white" : ""}
          >
            {completionRate}% done
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-fun-yellow/10 to-fun-yellow/5 rounded-xl p-3 text-center border border-fun-yellow/20">
            <div className="flex items-center justify-center gap-1 text-fun-yellow mb-1">
              <Star className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Points</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{balance || 0}</p>
          </div>
          
          <div className="bg-gradient-to-br from-fun-blue/10 to-fun-blue/5 rounded-xl p-3 text-center border border-fun-blue/20">
            <div className="flex items-center justify-center gap-1 text-fun-blue mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Tasks</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{completedTasks}/{totalTasks}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        {totalTasks > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Today's Progress</span>
              <span className="font-medium">{completedTasks} of {totalTasks} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  completionRate === 100 ? 'bg-gradient-to-r from-fun-green to-fun-secondary' :
                  completionRate >= 50 ? 'bg-gradient-to-r from-fun-blue to-fun-purple' :
                  'bg-gradient-to-r from-fun-orange to-fun-yellow'
                }`}
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks assigned yet</p>
          </div>
        )}
        
        {/* Quick Action */}
        <div className="pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs hover:bg-gray-50"
            onClick={() => window.open(`/kid/${kid.id}`, '_blank')}
          >
            View Kid Dashboard →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const OverviewTab = () => {
  const { data: kids, isLoading: kidsLoading } = useKids();
  const generateTasks = useGenerateTodayTasks();
  
  if (kidsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-gradient-to-r from-fun-purple/10 to-fun-blue/10 rounded-2xl p-6 border border-fun-purple/20">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-12 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalKids = kids?.length || 0;
  const totalTasks = kids?.reduce((sum, kid) => {
    // This would need individual task queries, simplified for now
    return sum;
  }, 0) || 0;
  
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-fun-purple/10 via-fun-blue/10 to-fun-green/10 rounded-2xl p-6 border border-fun-purple/20 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Users className="h-8 w-8 text-fun-purple" />
              Family Overview
            </h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Track your kids' progress • {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            {totalKids > 0 && (
              <div className="flex items-center gap-4 pt-2">
                <Badge variant="secondary" className="bg-white/80">
                  {totalKids} {totalKids === 1 ? 'Kid' : 'Kids'}
                </Badge>
              </div>
            )}
          </div>
          
          <Button 
            onClick={() => generateTasks.mutate()}
            disabled={generateTasks.isPending || totalKids === 0}
            size="lg"
            className="bg-gradient-to-r from-fun-purple to-fun-blue hover:from-fun-purple/90 hover:to-fun-blue/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
          >
            <Calendar className="h-5 w-5 mr-2" />
            {generateTasks.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Generating...
              </>
            ) : (
              'Generate Today\'s Tasks'
            )}
          </Button>
        </div>
      </div>
      
      {/* Kids Grid */}
      {!kids?.length ? (
        <Card className="border-2 border-dashed border-gray-300 hover:border-fun-purple/50 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-gradient-to-br from-fun-purple/10 to-fun-blue/10 rounded-full p-6 mb-6">
              <Users className="h-12 w-12 text-fun-purple" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-gray-800">No kids added yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Add your first kid to start tracking their tasks and rewards. Click the "Kids" tab to get started!
            </p>
            <Badge variant="outline" className="text-fun-purple border-fun-purple">
              Get started in the Kids tab →
            </Badge>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {kids.map(kid => (
            <KidOverviewCard key={kid.id} kid={kid} />
          ))}
        </div>
      )}

      {/* Quick Tips */}
      {kids && kids.length > 0 && (
        <Card className="bg-gradient-to-br from-fun-yellow/10 to-fun-orange/10 border-fun-yellow/30">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-gray-800">
              💡 Quick Tips
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-fun-green mt-0.5 flex-shrink-0" />
                  <span>Generate daily tasks each morning to keep kids on track</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-fun-blue mt-0.5 flex-shrink-0" />
                  <span>Kids can complete tasks on their dashboard to earn points</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-fun-yellow mt-0.5 flex-shrink-0" />
                  <span>Monitor redemption requests in the Redemptions tab</span>
                </p>
                <p className="flex items-start gap-2">
                  <PlayCircle className="h-4 w-4 text-fun-purple mt-0.5 flex-shrink-0" />
                  <span>Click "View Kid Dashboard" to see their experience</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OverviewTab;