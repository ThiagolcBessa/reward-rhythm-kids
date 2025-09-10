import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
    const prefix = isPositive ? '+' : '-';
    const color = isBonus ? 'text-kid-fun' : isPositive ? 'text-kid-success' : 'text-red-500';
    
    return (
      <span className={`font-bold text-lg ${color}`}>
        {prefix}{entry.points}
      </span>
    );
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {getIcon()}
          
          <div className="flex-1">
            <p className="font-medium text-gray-800">
              {entry.description}
            </p>
            <p className="text-sm text-gray-500">
              {format(new Date(entry.created_at), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>

        <div className="text-right">
          {getPointsDisplay()}
          <p className="text-xs text-gray-500 capitalize">
            {entry.entry_type}
            {isBonus && ' 🎉'}
          </p>
        </div>
      </div>
    </Card>
  );
};