import { useParams } from 'react-router-dom';
import { KidHeader } from '@/components/kid/KidHeader';
import { NavigationButtons } from '@/components/kid/NavigationButtons';
import CalendarView from '@/components/kid/CalendarView';
import { useKidInfo } from '@/hooks/use-supabase-rpc';

const KidCalendar = () => {
  const { kidId } = useParams<{ kidId: string }>();
  const { data: kidInfo } = useKidInfo(kidId!);

  return (
    <div className="min-h-screen bg-gradient-to-b from-kid-fun/10 to-white pb-24">
      <KidHeader kidName={kidInfo?.display_name || 'Loading...'} />
      
      <div className="max-w-6xl mx-auto">
        <div className="p-4 text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">📅 Task Calendar</h1>
          <p className="text-gray-600">See your tasks for the whole week!</p>
        </div>
        
        <CalendarView kidId={kidId!} viewType="kid" />
      </div>

      <NavigationButtons currentPage="calendar" />
    </div>
  );
};

export default KidCalendar;