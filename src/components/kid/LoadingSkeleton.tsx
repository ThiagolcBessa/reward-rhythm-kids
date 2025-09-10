import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const TaskCardSkeleton = () => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="h-12 w-12 rounded-full" />
        
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      
      <Skeleton className="h-16 w-16 rounded-2xl" />
    </div>
  </Card>
);

export const RewardCardSkeleton = () => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="h-16 w-16 rounded-full" />
        
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      
      <Skeleton className="h-14 w-20 rounded-2xl" />
    </div>
  </Card>
);

export const HistoryCardSkeleton = () => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="h-5 w-5 rounded" />
        
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      
      <div className="text-right space-y-1">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </Card>
);

export const HeaderSkeleton = () => (
  <div className="bg-gradient-to-r from-kid-primary to-kid-fun p-6 text-white rounded-b-3xl shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-32 bg-white/30" />
        <Skeleton className="h-4 w-48 bg-white/20 mt-2" />
      </div>
      
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
        <Skeleton className="h-3 w-12 bg-white/30 mb-1" />
        <Skeleton className="h-6 w-16 bg-white/40" />
      </div>
    </div>
  </div>
);