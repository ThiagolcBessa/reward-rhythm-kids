import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarView } from '@/components/kid/CalendarView';
import { useKids } from '@/hooks/use-parent-data';

const CalendarTab = () => {
  const { data: kids } = useKids();
  const [selectedKidId, setSelectedKidId] = useState<string>('');

  // Auto-select first kid if available and none selected
  if (kids && kids.length > 0 && !selectedKidId) {
    setSelectedKidId(kids[0].id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Task Calendar</h2>
          <p className="text-muted-foreground">View weekly task schedule for your kids</p>
        </div>
        
        <div className="w-full sm:w-auto">
          <Select
            value={selectedKidId}
            onValueChange={setSelectedKidId}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select a kid" />
            </SelectTrigger>
            <SelectContent>
              {kids?.map(kid => (
                <SelectItem key={kid.id} value={kid.id}>
                  {kid.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {selectedKidId ? (
        <CalendarView kidId={selectedKidId} viewType="parent" />
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            Select a kid to view their calendar
          </h3>
          <p className="text-gray-500">
            Choose from the dropdown above to see their weekly task schedule
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarTab;