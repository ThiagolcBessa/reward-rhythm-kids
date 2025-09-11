import { Coins, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRedeemReward, useKidBalance } from '@/hooks/use-supabase-rpc';
import type { Reward } from '@/hooks/use-supabase-rpc';

interface RewardCardProps {
  reward: Reward;
  kidId: string;
}

export const RewardCard: React.FC<RewardCardProps> = ({ reward, kidId }) => {
  const { toast } = useToast();
  const { data: balance = 0 } = useKidBalance(kidId);
  const redeemMutation = useRedeemReward();

  const canAfford = balance >= reward.cost_points;

  const handleRedeem = async () => {
    if (!canAfford) {
      toast({
        title: "Not enough points!",
        description: `You need ${reward.cost_points - balance} more points to get this reward.`,
        variant: "destructive",
      });
      return;
    }

    await redeemMutation.mutateAsync({ kidId, rewardId: reward.id });
  };

  return (
    <Card className={`p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 ${
      canAfford 
        ? 'border-kid-success bg-gradient-to-br from-white to-kid-success/5' 
        : 'border-gray-200 opacity-75 bg-gray-50'
    }`}>
      <div className="flex items-center gap-4">
        <div className="text-5xl animate-bounce-in">{reward.icon_emoji}</div>
        
        <div className="flex-1">
          <h3 className="font-bold text-xl text-gray-800 mb-1">
            {reward.title}
          </h3>
          
          {reward.description && (
            <p className="text-sm text-gray-600 mb-2">
              {reward.description}
            </p>
          )}
          
          <div className="flex items-center gap-1">
            <Coins className="h-5 w-5 text-kid-warning animate-spin-slow" />
            <span className="font-bold text-lg text-kid-warning">
              {reward.cost_points} points
            </span>
          </div>

          {!canAfford && (
            <p className="text-sm text-red-500 mt-1 font-medium">
              Need {reward.cost_points - balance} more points
            </p>
          )}
        </div>

        <Button
          onClick={handleRedeem}
          disabled={!canAfford || redeemMutation.isPending}
          size="lg"
          className={`rounded-3xl px-6 py-8 h-auto font-bold text-lg min-w-[100px] transition-all duration-200 shadow-lg ${
            canAfford
              ? 'bg-gradient-to-r from-kid-success to-kid-secondary hover:from-kid-success/90 hover:to-kid-secondary/90 text-white active:scale-95 hover:shadow-xl animate-pulse-glow'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
          }`}
        >
          {redeemMutation.isPending ? (
            <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              <span className="text-sm font-bold">
                {canAfford ? 'GET IT!' : 'SAVE UP'}
              </span>
            </div>
          )}
        </Button>
      </div>
    </Card>
  );
};