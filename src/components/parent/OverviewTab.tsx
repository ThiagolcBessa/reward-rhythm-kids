import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useKids, useGenerateTodayTasks } from '@/hooks/use-parent-data';
import { useKidBalance, useKidTodayTasks } from '@/hooks/use-supabase-rpc';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, Star, Calendar } from 'lucide-react';

interface KidOverviewCardProps {
  kid: {
    id: string;
    display_name: string;
    color_hex: string | null;
  };
}

const KidOverviewCard = ({ kid }: KidOverviewCardProps) => {
  const { data: balance, isLoading: balanceLoading } = useKidBalance(kid.id);
  const { data: tasks, isLoading: tasksLoading } = useKidTodayTasks(kid.id);
  
  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
  const totalTasks = tasks?.length || 0;
  
  if (balanceLoading || tasksLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: kid.color_hex || '#3B82F6' }}
          />
          {kid.display_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-fun-yellow" />
            <span className="font-medium">{balance || 0} points</span>
          </div>
          <Badge variant={completedTasks === totalTasks && totalTasks > 0 ? "default" : "secondary"}>
            {completedTasks}/{totalTasks} tasks
          </Badge>
        </div>
        
        {totalTasks > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-fun-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            />
          </div>
        )}
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
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Family Overview</h2>
          <p className="text-muted-foreground">Track your kids' progress today</p>
        </div>
        
        <Button 
          onClick={() => generateTasks.mutate()}
          disabled={generateTasks.isPending}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          {generateTasks.isPending ? 'Generating...' : 'Generate Today\'s Tasks'}
        </Button>
      </div>
      
      {!kids?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PlayCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No kids added yet</h3>
            <p className="text-muted-foreground text-center">
              Add your first kid to start tracking their tasks and rewards
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {kids.map(kid => (
            <KidOverviewCard key={kid.id} kid={kid} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OverviewTab;