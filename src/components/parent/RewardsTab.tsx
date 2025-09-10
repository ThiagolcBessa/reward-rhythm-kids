import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRewards, useFamily } from '@/hooks/use-parent-data';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import { Reward } from '@/hooks/use-parent-data';

interface RewardFormProps {
  reward?: Reward;
  onClose: () => void;
}

const RewardForm = ({ reward, onClose }: RewardFormProps) => {
  const [formData, setFormData] = useState({
    title: reward?.title || '',
    description: reward?.description || '',
    icon_emoji: reward?.icon_emoji || '🎁',
    cost_points: reward?.cost_points || 50,
    active: reward?.active ?? true,
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
      if (reward) {
        // Update existing reward
        const { error } = await supabase
          .from('reward')
          .update(formData)
          .eq('id', reward.id);
        
        if (error) throw error;
        
        toast({
          title: "Reward updated!",
          description: "Your changes have been saved.",
        });
      } else {
        // Create new reward
        const { error } = await supabase
          .from('reward')
          .insert({
            ...formData,
            family_id: family.id,
          });
        
        if (error) throw error;
        
        toast({
          title: "Reward created!",
          description: "New reward has been added.",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
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
          <Label htmlFor="cost">Cost (Points)</Label>
          <Input
            id="cost"
            type="number"
            min="1"
            value={formData.cost_points}
            onChange={(e) => setFormData(prev => ({ ...prev, cost_points: parseInt(e.target.value) || 0 }))}
            required
          />
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : reward ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

const RewardsTab = () => {
  const { data: rewards, isLoading } = useRewards();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const handleDelete = async (rewardId: string) => {
    try {
      const { error } = await supabase
        .from('reward')
        .delete()
        .eq('id', rewardId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      toast({
        title: "Reward deleted",
        description: "The reward has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting reward",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return <div>Loading rewards...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Rewards</h2>
          <p className="text-muted-foreground">Manage rewards your kids can redeem</p>
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Reward</DialogTitle>
            </DialogHeader>
            <RewardForm onClose={() => setShowForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rewards?.map(reward => (
          <Card key={reward.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">{reward.icon_emoji}</span>
                {reward.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reward.description && (
                <p className="text-sm text-muted-foreground">{reward.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-fun-yellow" />
                  <span className="font-medium">{reward.cost_points} points</span>
                </div>
                <Badge variant={reward.active ? 'default' : 'secondary'}>
                  {reward.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex justify-end gap-2">
                <Dialog 
                  open={editingReward?.id === reward.id} 
                  onOpenChange={(open) => setEditingReward(open ? reward : null)}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Reward</DialogTitle>
                    </DialogHeader>
                    <RewardForm 
                      reward={editingReward!} 
                      onClose={() => setEditingReward(null)} 
                    />
                  </DialogContent>
                </Dialog>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDelete(reward.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {!rewards?.length && (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No rewards yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsTab;