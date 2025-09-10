import { useParams } from 'react-router-dom';
import { History, TrendingUp, Trophy, Coins } from 'lucide-react';
import { KidHeader } from '@/components/kid/KidHeader';
import { PointsHistoryCard } from '@/components/kid/PointsHistoryCard';
import { NavigationButtons } from '@/components/kid/NavigationButtons';
import { HistoryCardSkeleton, HeaderSkeleton } from '@/components/kid/LoadingSkeleton';
import { useKidPointsHistory, useKidBalance, useKidInfo } from '@/hooks/use-supabase-rpc';

const KidHistory = () => {
  const { kidId } = useParams<{ kidId: string }>();
  const { data: history, isLoading: historyLoading } = useKidPointsHistory(kidId!);
  const { data: balance = 0, isLoading: balanceLoading } = useKidBalance(kidId!);
  const { data: kidInfo, isLoading: kidLoading } = useKidInfo(kidId!);

  const isLoading = historyLoading || kidLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-kid-secondary/10 to-white pb-24">
        <HeaderSkeleton />
        
        <div className="p-4 space-y-4 max-w-md mx-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <HistoryCardSkeleton key={i} />
          ))}
        </div>
        
        <NavigationButtons currentPage="history" />
      </div>
    );
  }

  // Calculate total earned points
  const totalEarned = history?.reduce((sum, entry) => {
    if (entry.entry_type === 'credit' || entry.entry_type === 'bonus') {
      return sum + entry.points;
    }
    return sum;
  }, 0) || 0;

  // Calculate total spent points
  const totalSpent = history?.reduce((sum, entry) => {
    if (entry.entry_type === 'debit') {
      return sum + entry.points;
    }
    return sum;
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-kid-secondary/10 to-white pb-24">
      <KidHeader kidName={kidInfo?.display_name || 'Loading...'} />
      
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <History className="h-6 w-6 text-kid-secondary" />
            <h2 className="text-2xl font-bold text-gray-800">Points History</h2>
          </div>
          <p className="text-gray-600">
            Track all your amazing achievements!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
            <TrendingUp className="h-6 w-6 text-kid-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-kid-success">{totalEarned}</p>
            <p className="text-xs text-gray-500">Total Earned</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
            <Trophy className="h-6 w-6 text-kid-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-kid-warning">{totalSpent}</p>
            <p className="text-xs text-gray-500">Total Spent</p>
          </div>
        </div>

        {/* Current Balance */}
        <div className="bg-gradient-to-r from-kid-primary via-kid-fun to-kid-secondary text-white rounded-2xl p-6 text-center shadow-lg border-2 border-white/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coins className="h-6 w-6 text-yellow-300 animate-spin-slow" />
            <h3 className="text-lg font-semibold">Current Balance</h3>
          </div>
          {balanceLoading ? (
            <div className="animate-pulse">
              <div className="h-8 w-20 bg-white/20 rounded mx-auto mb-2"></div>
            </div>
          ) : (
            <p className="text-4xl font-bold mb-1 animate-scale-in">{balance} points</p>
          )}
          <p className="text-sm opacity-90">Keep earning more! 🌟</p>
        </div>

        {/* History List */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            📊 Recent Activity
          </h3>
          
          {!history || history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No history yet
              </h3>
              <p className="text-gray-500">
                Complete tasks to start earning points!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-kid-primary scrollbar-track-gray-100">
              {history.map((entry, index) => (
                <div 
                  key={entry.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PointsHistoryCard entry={entry} />
                </div>
              ))}
              
              {history.length >= 50 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
                    📋 Showing your latest 50 activities
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Motivational Message */}
        {totalEarned > 0 && (
          <div className="bg-kid-success/10 rounded-2xl p-4 border border-kid-success/20 text-center">
            <div className="text-2xl mb-2">🌟</div>
            <h3 className="font-bold text-kid-success mb-1">
              You're doing amazing!
            </h3>
            <p className="text-sm text-gray-700">
              You've earned {totalEarned} points so far. Keep up the great work!
            </p>
          </div>
        )}
      </div>

      <NavigationButtons currentPage="history" />
    </div>
  );
};

export default KidHistory;