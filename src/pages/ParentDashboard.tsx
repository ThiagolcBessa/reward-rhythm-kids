import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import OverviewTab from '@/components/parent/OverviewTab';
import TaskTemplatesTab from '@/components/parent/TaskTemplatesTab';
import RewardsTab from '@/components/parent/RewardsTab';
import RedemptionsTab from '@/components/parent/RedemptionsTab';
import KidsTab from '@/components/parent/KidsTab';
import ConfigTab from '@/components/parent/ConfigTab';
import { 
  BarChart3, 
  CheckSquare, 
  Gift, 
  Package, 
  Users, 
  Settings 
} from 'lucide-react';

const ParentDashboard = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-fun-blue/5 to-fun-purple/5">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-fun-purple mb-2">
            Parent Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your family's reward system
          </p>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Rewards</span>
            </TabsTrigger>
            <TabsTrigger value="redemptions" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Redemptions</span>
            </TabsTrigger>
            <TabsTrigger value="kids" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Kids</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          
          <TabsContent value="tasks">
            <TaskTemplatesTab />
          </TabsContent>
          
          <TabsContent value="rewards">
            <RewardsTab />
          </TabsContent>
          
          <TabsContent value="redemptions">
            <RedemptionsTab />
          </TabsContent>
          
          <TabsContent value="kids">
            <KidsTab />
          </TabsContent>
          
          <TabsContent value="config">
            <ConfigTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentDashboard;