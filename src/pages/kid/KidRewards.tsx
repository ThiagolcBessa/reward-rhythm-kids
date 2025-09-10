import { useParams } from 'react-router-dom';
import { Gift, Sparkles } from 'lucide-react';
import { KidHeader } from '@/components/kid/KidHeader';
import { RewardCard } from '@/components/kid/RewardCard';
import { NavigationButtons } from '@/components/kid/NavigationButtons';
import { RewardCardSkeleton, HeaderSkeleton } from '@/components/kid/LoadingSkeleton';
import { useKidRewards } from '@/hooks/use-supabase-rpc';

const KidRewards = () => {
  const { kidId } = useParams<{ kidId: string }>();
  const { data: rewards, isLoading } = useKidRewards(kidId!);

  // Mock kid name - in real app, this would come from API
  const kidName = "Alex";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-kid-warning/10 to-white pb-24">
        <HeaderSkeleton />
        
        <div className="p-4 space-y-4 max-w-md mx-auto">
          {[1, 2, 3].map((i) => (
            <RewardCardSkeleton key={i} />
          ))}
        </div>
        
        <NavigationButtons currentPage="rewards" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-kid-warning/10 to-white pb-24">
      <KidHeader kidName={kidName} />
      
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="h-6 w-6 text-kid-warning" />
            <h2 className="text-2xl font-bold text-gray-800">Reward Store</h2>
            <Sparkles className="h-6 w-6 text-kid-fun animate-wiggle" />
          </div>
          <p className="text-gray-600">
            Save up your points to get awesome rewards!
          </p>
        </div>

        {/* Rewards Grid */}
        <div className="space-y-4">
          {!rewards || rewards.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No rewards available
              </h3>
              <p className="text-gray-500">
                Ask your parent to add some cool rewards!
              </p>
            </div>
          ) : (
            rewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} kidId={kidId!} />
            ))
          )}
        </div>

        {/* Tips */}
        {rewards && rewards.length > 0 && (
          <div className="bg-kid-fun/10 rounded-2xl p-4 border border-kid-fun/20">
            <h3 className="font-bold text-kid-fun mb-2 flex items-center gap-2">
              💡 Tips
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Complete all your daily tasks to earn bonus points!</li>
              <li>• Save up for bigger rewards - they're worth it!</li>
              <li>• Ask your parent if you want to request new rewards!</li>
            </ul>
          </div>
        )}
      </div>

      <NavigationButtons currentPage="rewards" />
    </div>
  );
};

export default KidRewards;