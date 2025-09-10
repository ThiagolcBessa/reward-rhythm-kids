import { useState } from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useGrantBonus, useBonusEligibility } from '@/hooks/use-supabase-rpc';

interface BonusButtonProps {
  kidId: string;
  period: 'daily' | 'weekly';
}

export const BonusButton: React.FC<BonusButtonProps> = ({ kidId, period }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  const { data: eligibility } = useBonusEligibility(kidId, period);
  const grantBonusMutation = useGrantBonus();

  const handleGrantBonus = async () => {
    try {
      const newBalance = await grantBonusMutation.mutateAsync({ kidId, period });
      
      // Show confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      
      toast({
        title: "🏆 BONUS EARNED!",
        description: `Amazing! You got ${eligibility?.bonus_points} bonus points! New balance: ${newBalance}`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Already claimed!",
        description: `You've already earned your ${period} bonus today!`,
        variant: "destructive",
      });
    }
  };

  if (!eligibility?.eligible || eligibility?.already_granted) {
    return null;
  }

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          gravity={0.2}
          colors={['#9333ea', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6']}
        />
      )}
      
      <div className="bg-gradient-to-r from-kid-fun to-kid-primary p-4 rounded-2xl text-white animate-fade-in">
        <div className="text-center mb-3">
          <p className="text-sm opacity-90">
            Completed {eligibility.completed_tasks}/{eligibility.total_tasks} tasks {period === 'daily' ? 'today' : 'this week'}
          </p>
        </div>
        
        <Button
          onClick={handleGrantBonus}
          disabled={grantBonusMutation.isPending}
          className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-big border border-white/20"
          size="lg"
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-300" />
            <Sparkles className="h-5 w-5 text-yellow-300 animate-wiggle" />
            <span>
              Claim {period === 'daily' ? 'Daily' : 'Weekly'} Bonus! 
              (+{eligibility.bonus_points} pts)
            </span>
            <Sparkles className="h-5 w-5 text-yellow-300 animate-wiggle" />
          </div>
        </Button>
      </div>
    </>
  );
};