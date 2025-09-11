import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment, Assignment, CreateAssignmentData } from '@/hooks/use-assignments';
import { useKids, useTaskTemplates, useKidsForFamily, useTemplatesForFamily } from '@/hooks/use-parent-data';
import { Plus, Edit2, Trash2, CalendarIcon, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
];

interface AssignmentFormProps {
  assignment?: Assignment;
  onClose: () => void;
}

const AssignmentForm = ({ assignment, onClose }: AssignmentFormProps) => {
  const { data: kids, isLoading: kidsLoading, error: kidsError } = useKidsForFamily();
  const { data: taskTemplates, isLoading: templatesLoading, error: templatesError } = useTemplatesForFamily();
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();
  const taskTemplateSelectRef = useRef<HTMLButtonElement>(null);
  
  const [formData, setFormData] = useState({
    kid_id: assignment?.kid_id || '',
    task_template_id: assignment?.task_template_id || '',
    days_of_week: assignment?.days_of_week || [],
    base_points_override: assignment?.base_points_override || null,
    start_date: assignment?.start_date ? new Date(assignment.start_date) : new Date(),
    end_date: assignment?.end_date ? new Date(assignment.end_date) : null,
    active: assignment?.active ?? true,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate days of week
    if (formData.days_of_week.length > 7) {
      return; // This shouldn't happen due to UI constraints, but just in case
    }
    
    const submitData: CreateAssignmentData = {
      kid_id: formData.kid_id,
      task_template_id: formData.task_template_id,
      days_of_week: formData.days_of_week.length > 0 ? formData.days_of_week : null,
      base_points_override: formData.base_points_override,
      start_date: format(formData.start_date, 'yyyy-MM-dd'),
      end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
      active: formData.active,
    };
    
    if (assignment) {
      await updateMutation.mutateAsync({ id: assignment.id, ...submitData });
    } else {
      await createMutation.mutateAsync(submitData);
    }
    
    onClose();
  };
  
  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : prev.days_of_week.length < 7 
          ? [...prev.days_of_week, day]
          : prev.days_of_week // Don't add if already at max
    }));
  };

  const removeDayFromSelection = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.filter(d => d !== day)
    }));
  };

  // Listen for focus-task-template event
  useEffect(() => {
    const handleFocusTaskTemplate = () => {
      if (taskTemplateSelectRef.current) {
        taskTemplateSelectRef.current.focus();
      }
    };

    window.addEventListener('focus-task-template', handleFocusTaskTemplate);
    return () => window.removeEventListener('focus-task-template', handleFocusTaskTemplate);
  }, []);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kid</Label>
          <Select
            value={formData.kid_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, kid_id: value }))}
            required
            disabled={kidsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                kidsLoading ? "Loading kids..." : 
                kidsError ? "Error loading kids" : 
                "Select kid"
              } />
            </SelectTrigger>
            <SelectContent>
              {kids?.map(kid => (
                <SelectItem key={kid.id} value={kid.id}>
                  {kid.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {kidsError && (
            <p className="text-sm text-destructive">Failed to load kids</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Task Template</Label>
          <Select
            value={formData.task_template_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, task_template_id: value }))}
            required
            disabled={templatesLoading}
          >
            <SelectTrigger ref={taskTemplateSelectRef}>
              <SelectValue placeholder={
                templatesLoading ? "Loading templates..." : 
                templatesError ? "Error loading templates" : 
                "Select task"
              } />
            </SelectTrigger>
            <SelectContent>
              {taskTemplates?.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {templatesError && (
            <p className="text-sm text-destructive">Failed to load task templates</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Days of Week</Label>
        <div className="space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between font-normal"
              >
                <span className="truncate">
                  {formData.days_of_week.length === 0
                    ? "All days (leave empty for any day)"
                    : formData.days_of_week.length === 7
                    ? "All days selected"
                    : `${formData.days_of_week.length} day${formData.days_of_week.length > 1 ? 's' : ''} selected`
                  }
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-popover border border-border shadow-lg z-50" align="start">
              <div className="max-h-64 overflow-auto bg-popover">
                <div className="p-2 space-y-1">
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day.value}
                      className={cn(
                        "flex items-center space-x-2 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                        formData.days_of_week.includes(day.value) && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => handleDayToggle(day.value)}
                    >
                      <Checkbox
                        checked={formData.days_of_week.includes(day.value)}
                        className="pointer-events-none"
                      />
                      <span className="flex-1 text-sm">{day.label}</span>
                    </div>
                  ))}
                </div>
                {formData.days_of_week.length >= 7 && (
                  <div className="border-t border-border p-2">
                    <p className="text-xs text-muted-foreground">Maximum 7 days selected</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Selected days display */}
          {formData.days_of_week.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.days_of_week.map((day) => {
                const dayLabel = DAYS_OF_WEEK.find(d => d.value === day)?.label || day;
                return (
                  <Badge key={day} variant="secondary" className="text-xs pr-1">
                    {dayLabel}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                      onClick={() => removeDayFromSelection(day)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            {formData.days_of_week.length === 0 
              ? "Leave empty to assign task for all days"
              : `Selected ${formData.days_of_week.length} of 7 days`
            }
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Base Points Override</Label>
        <Select
          value={formData.base_points_override?.toString() || 'default'}
          onValueChange={(value) => 
            setFormData(prev => ({ 
              ...prev, 
              base_points_override: value === "default" ? null : parseInt(value) 
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Use template default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Use template default</SelectItem>
            <SelectItem value="5">5 points</SelectItem>
            <SelectItem value="10">10 points</SelectItem>
            <SelectItem value="15">15 points</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !formData.start_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.start_date}
                onSelect={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label>End Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !formData.end_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.end_date ? format(formData.end_date, "PPP") : "No end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.end_date || undefined}
                onSelect={(date) => setFormData(prev => ({ ...prev, end_date: date || null }))}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
        />
        <Label htmlFor="active">Active</Label>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {assignment ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

const AssignmentsTab = () => {
  const { data: assignments, isLoading } = useAssignments();
  const deleteMutation = useDeleteAssignment();
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const handleDelete = async (assignmentId: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      await deleteMutation.mutateAsync(assignmentId);
    }
  };
  
  if (isLoading) {
    return <div>Loading assignments...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Task Assignments</h2>
          <p className="text-muted-foreground">Assign specific tasks to kids with custom schedules</p>
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Task Assignment</DialogTitle>
            </DialogHeader>
            <AssignmentForm onClose={() => setShowForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kid</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments?.map(assignment => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.kid.display_name}
                    </TableCell>
                    <TableCell>
                      {assignment.task_template.title}
                    </TableCell>
                    <TableCell>
                      {assignment.days_of_week ? (
                        <div className="flex flex-wrap gap-1">
                          {assignment.days_of_week.map(day => (
                            <Badge key={day} variant="secondary" className="text-xs">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">All days</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {assignment.base_points_override || assignment.task_template.base_points} pts
                      {assignment.base_points_override && (
                        <Badge variant="outline" className="ml-1 text-xs">override</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Start: {format(new Date(assignment.start_date), 'MMM d')}</div>
                        {assignment.end_date && (
                          <div className="text-muted-foreground">
                            End: {format(new Date(assignment.end_date), 'MMM d')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={assignment.active ? 'default' : 'secondary'}>
                        {assignment.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog 
                          open={editingAssignment?.id === assignment.id} 
                          onOpenChange={(open) => setEditingAssignment(open ? assignment : null)}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Assignment</DialogTitle>
                            </DialogHeader>
                            <AssignmentForm 
                              assignment={editingAssignment!} 
                              onClose={() => setEditingAssignment(null)} 
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(assignment.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {!assignments?.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No assignments yet. Create your first one!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentsTab;