import { useNavigate, useParams } from 'react-router-dom';
import { Gift, History, Home, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationButtonsProps {
  currentPage?: 'dashboard' | 'calendar' | 'rewards' | 'history';
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ currentPage = 'dashboard' }) => {
  const navigate = useNavigate();
  const { kidId } = useParams<{ kidId: string }>();

  const buttons = [
    {
      key: 'dashboard',
      label: 'Tasks',
      icon: Home,
      path: `/kid/${kidId}`,
      color: 'bg-kid-primary',
    },
    {
      key: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      path: `/kid/${kidId}/calendar`,
      color: 'bg-kid-fun',
    },
    {
      key: 'rewards',
      label: 'Rewards',
      icon: Gift,
      path: `/kid/${kidId}/rewards`,
      color: 'bg-kid-warning',
    },
    {
      key: 'history',
      label: 'History',
      icon: History,
      path: `/kid/${kidId}/history`,
      color: 'bg-kid-secondary',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-pb">
      <div className="flex gap-2 max-w-md mx-auto">
        {buttons.map((button) => {
          const Icon = button.icon;
          const isActive = currentPage === button.key;
          
          return (
            <Button
              key={button.key}
              onClick={() => navigate(button.path)}
              size="lg"
              className={`flex-1 h-14 rounded-2xl text-white font-medium transition-all duration-200 ${
                isActive 
                  ? `${button.color} shadow-lg scale-105` 
                  : 'bg-gray-300 hover:bg-gray-400 active:scale-95'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Icon className="h-5 w-5" />
                <span className="text-xs">{button.label}</span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};