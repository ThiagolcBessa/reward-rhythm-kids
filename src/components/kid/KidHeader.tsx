import { useParams } from 'react-router-dom';
import { Coins, Star } from 'lucide-react';
import { useKidBalance } from '@/hooks/use-supabase-rpc';
import { Skeleton } from '@/components/ui/skeleton';

interface KidHeaderProps {
  kidName: string;
}

export const KidHeader: React.FC<KidHeaderProps> = ({ kidName }) => {
  const { kidId } = useParams<{ kidId: string }>();
  const { data: balance, isLoading } = useKidBalance(kidId!);

  return (
    <div className="bg-gradient-to-r from-kid-primary to-kid-fun p-6 text-white rounded-b-3xl shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-300 animate-pulse-big" />
            {kidName}
          </h1>
          <p className="text-kid-primary-foreground/80 text-sm mt-1">Keep going! You're awesome!</p>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
          <Coins className="h-6 w-6 text-yellow-300" />
          <div>
            <p className="text-xs opacity-80">Points</p>
            {isLoading ? (
              <Skeleton className="h-6 w-12 bg-white/30" />
            ) : (
              <p className="text-xl font-bold">{balance || 0}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};