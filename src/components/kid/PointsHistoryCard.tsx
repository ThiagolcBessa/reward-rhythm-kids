import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatPoints, getRelativeTime } from '@/lib/utils';
import type { PointsLedgerEntry } from '@/hooks/use-supabase-rpc';

interface PointsHistoryCardProps {
  entry: PointsLedgerEntry;
}

export const PointsHistoryCard: React.FC<PointsHistoryCardProps> = ({ entry }) => {
  const isPositive = entry.entry_type === 'credit' || entry.entry_type === 'bonus';
  const isBonus = entry.entry_type === 'bonus';

  const getIcon = () => {
    if (isBonus) return <Star className="h-5 w-5 text-kid-fun" />;
    return isPositive ? 
      <TrendingUp className="h-5 w-5 text-kid-success" /> : 
      <TrendingDown className="h-5 w-5 text-red-500" />;
  };

  const getPointsDisplay = () => {
    const color = isBonus ? 'text-kid-fun' : isPositive ? 'text-kid-success' : 'text-red-500';
    
    return (
      <span className={`font-bold text-lg ${color}`}>
        {formatPoints(entry.points, entry.entry_type)}
      </span>
    );
  };

  return (
    <Card className={`p-4 hover:shadow-lg transition-all duration-200 border-l-4 ${
      isBonus ? 'border-l-kid-fun bg-gradient-to-r from-kid-fun/5 to-transparent' :
      isPositive ? 'border-l-kid-success bg-gradient-to-r from-kid-success/5 to-transparent' : 
      'border-l-red-400 bg-gradient-to-r from-red-50 to-transparent'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className={`p-2 rounded-full ${
            isBonus ? 'bg-kid-fun/20' :
            isPositive ? 'bg-kid-success/20' : 'bg-red-100'
          }`}>
            {getIcon()}
          </div>
          
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm">
              {entry.description}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {getRelativeTime(entry.created_at)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1">
            {getPointsDisplay()}
            {isBonus && <span className="text-lg">🎉</span>}
          </div>
          <p className="text-xs text-gray-500 capitalize mt-1">
            {entry.entry_type === 'bonus' ? 'Bonus' : 
             entry.entry_type === 'credit' ? 'Earned' : 'Spent'}
          </p>
        </div>
      </div>
    </Card>
  );
};