import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useKids, useFamily } from '@/hooks/use-parent-data';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { Kid } from '@/hooks/use-parent-data';

interface KidFormProps {
  kid?: Kid;
  onClose: () => void;
}

const KidForm = ({ kid, onClose }: KidFormProps) => {
  const [formData, setFormData] = useState({
    display_name: kid?.display_name || '',
    age: kid?.age || '',
    avatar_url: kid?.avatar_url || '',
    color_hex: kid?.color_hex || '#3B82F6',
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
      const kidData = {
        ...formData,
        age: formData.age ? parseInt(formData.age.toString()) : null,
        avatar_url: formData.avatar_url || null,
        family_id: family.id,
      };
      
      if (kid) {
        // Update existing kid
        const { error } = await supabase
          .from('kid')
          .update(kidData)
          .eq('id', kid.id);
        
        if (error) throw error;
        
        toast({
          title: "Kid updated!",
          description: "Changes have been saved.",
        });
      } else {
        // Create new kid
        const { error } = await supabase
          .from('kid')
          .insert(kidData);
        
        if (error) throw error;
        
        toast({
          title: "Kid added!",
          description: "New kid has been added to your family.",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['kids'] });
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
  
  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.display_name}
          onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="age">Age (optional)</Label>
        <Input
          id="age"
          type="number"
          min="1"
          max="18"
          value={formData.age}
          onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="avatar">Avatar URL (optional)</Label>
        <Input
          id="avatar"
          type="url"
          value={formData.avatar_url}
          onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Color Theme</Label>
        <div className="flex gap-2 flex-wrap">
          {colorOptions.map(color => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                formData.color_hex === color ? 'border-foreground' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData(prev => ({ ...prev, color_hex: color }))}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : kid ? 'Update' : 'Add Kid'}
        </Button>
      </div>
    </form>
  );
};

const KidsTab = () => {
  const { data: kids, isLoading } = useKids();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingKid, setEditingKid] = useState<Kid | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const handleDelete = async (kidId: string) => {
    try {
      const { error } = await supabase
        .from('kid')
        .delete()
        .eq('id', kidId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['kids'] });
      toast({
        title: "Kid removed",
        description: "The kid has been removed from your family.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing kid",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return <div>Loading kids...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Kids</h2>
          <p className="text-muted-foreground">Manage your family members</p>
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Kid
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Kid</DialogTitle>
            </DialogHeader>
            <KidForm onClose={() => setShowForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kids?.map(kid => (
          <Card key={kid.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {kid.avatar_url ? (
                    <img 
                      src={kid.avatar_url} 
                      alt={kid.display_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: kid.color_hex || '#3B82F6' }}
                    >
                      {kid.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{kid.display_name}</div>
                    {kid.age && (
                      <div className="text-sm text-muted-foreground">{kid.age} years old</div>
                    )}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2">
                <Dialog 
                  open={editingKid?.id === kid.id} 
                  onOpenChange={(open) => setEditingKid(open ? kid : null)}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Kid</DialogTitle>
                    </DialogHeader>
                    <KidForm 
                      kid={editingKid!} 
                      onClose={() => setEditingKid(null)} 
                    />
                  </DialogContent>
                </Dialog>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDelete(kid.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {!kids?.length && (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No kids added yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add your first kid to start tracking their tasks and rewards
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Kid
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default KidsTab;