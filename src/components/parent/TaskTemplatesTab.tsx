import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTaskTemplates, useFamily } from '@/hooks/use-parent-data';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { TaskTemplate } from '@/hooks/use-parent-data';

interface TaskTemplateFormProps {
  template?: TaskTemplate;
  onClose: () => void;
}

const TaskTemplateForm = ({ template, onClose }: TaskTemplateFormProps) => {
  const [formData, setFormData] = useState({
    title: template?.title || '',
    description: template?.description || '',
    icon_emoji: template?.icon_emoji || '✅',
    base_points: template?.base_points || 5,
    recurrence: template?.recurrence || 'daily',
    active: template?.active ?? true,
  });
  
  const { data: family } = useFamily();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!family) return;
    
    setIsSubmitting(true);
    
    try {
      if (template) {
        // Update existing template
        const { error } = await supabase
          .from('task_template')
          .update(formData)
          .eq('id', template.id);
        
        if (error) throw error;
        
        toast({
          title: "Task template updated!",
          description: "Your changes have been saved.",
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from('task_template')
          .insert({
            ...formData,
            family_id: family.id,
          });
        
        if (error) throw error;
        
        toast({
          title: "Task template created!",
          description: "New task template has been added.",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="icon">Icon Emoji</Label>
          <Input
            id="icon"
            value={formData.icon_emoji}
            onChange={(e) => setFormData(prev => ({ ...prev, icon_emoji: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="points">Base Points</Label>
          <Select
            value={formData.base_points.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, base_points: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 points</SelectItem>
              <SelectItem value="10">10 points</SelectItem>
              <SelectItem value="15">15 points</SelectItem>
              <SelectItem value="20">20 points</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recurrence">Recurrence</Label>
          <Select
            value={formData.recurrence}
            onValueChange={(value: 'daily' | 'weekly' | 'once') => 
              setFormData(prev => ({ ...prev, recurrence: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="once">Once</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
          />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : template ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

const TaskTemplatesTab = () => {
  const { data: templates, isLoading } = useTaskTemplates();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const handleDelete = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('task_template')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      toast({
        title: "Task template deleted",
        description: "The template has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting template",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return <div>Loading task templates...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Task Templates</h2>
          <p className="text-muted-foreground">Manage recurring tasks for your kids</p>
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Task Template</DialogTitle>
            </DialogHeader>
            <TaskTemplateForm onClose={() => setShowForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates?.map(template => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">{template.icon_emoji}</span>
                {template.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {template.description && (
                <p className="text-sm text-muted-foreground">{template.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{template.base_points} points</Badge>
                <Badge variant={template.recurrence === 'daily' ? 'default' : 'outline'}>
                  {template.recurrence}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant={template.active ? 'default' : 'secondary'}>
                  {template.active ? 'Active' : 'Inactive'}
                </Badge>
                
                <div className="flex gap-2">
                  <Dialog 
                    open={editingTemplate?.id === template.id} 
                    onOpenChange={(open) => setEditingTemplate(open ? template : null)}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Task Template</DialogTitle>
                      </DialogHeader>
                      <TaskTemplateForm 
                        template={editingTemplate!} 
                        onClose={() => setEditingTemplate(null)} 
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {!templates?.length && (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No task templates yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTemplatesTab;