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

    try {
      await redeemMutation.mutateAsync({ kidId, rewardId: reward.id });
      
      toast({
        title: "🎁 Reward requested!",
        description: `Your ${reward.title} request has been sent to your parent!`,
        duration: 4000,
      });
    } catch (error) {
      toast({
        title: "Oops!",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again!",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
      canAfford ? 'border-kid-success' : 'border-gray-200 opacity-75'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-4xl">{reward.icon_emoji}</div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800">
              {reward.title}
            </h3>
            
            {reward.description && (
              <p className="text-sm text-gray-600 mt-1">
                {reward.description}
              </p>
            )}
            
            <div className="flex items-center gap-1 mt-2">
              <Coins className="h-4 w-4 text-kid-warning" />
              <span className="font-semibold text-kid-warning">
                {reward.cost_points} points
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleRedeem}
          disabled={!canAfford || redeemMutation.isPending}
          size="lg"
          className={`rounded-2xl min-w-[80px] h-14 font-medium transition-all duration-200 ${
            canAfford
              ? 'bg-kid-success hover:bg-kid-success/90 text-white active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {redeemMutation.isPending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs">
                {canAfford ? 'Get it!' : 'Need more'}
              </span>
            </div>
          )}
        </Button>
      </div>
    </Card>
  );
};