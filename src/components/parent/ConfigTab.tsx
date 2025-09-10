import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFamily } from '@/hooks/use-parent-data';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Settings, User, LogOut } from 'lucide-react';

const ConfigTab = () => {
  const { data: family, isLoading } = useFamily();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [familyName, setFamilyName] = useState(family?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Update local state when family data loads
  React.useEffect(() => {
    if (family?.name && familyName !== family.name) {
      setFamilyName(family.name);
    }
  }, [family?.name, familyName]);
  
  const handleUpdateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!family || !familyName.trim()) return;
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('family')
        .update({ name: familyName.trim() })
        .eq('id', family.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['family'] });
      toast({
        title: "Family updated!",
        description: "Your family name has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating family",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (isLoading) {
    return <div>Loading configuration...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuration</h2>
        <p className="text-muted-foreground">Manage your family settings and account</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Family Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateFamily} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="family-name">Family Name</Label>
                <Input
                  id="family-name"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" disabled={isUpdating || familyName === family?.name}>
                {isUpdating ? 'Updating...' : 'Update Family Name'}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2"><strong>Note:</strong> This family is owned by your account.</p>
                <p>Family Owner: {user?.email}</p>
                <p>Owner UID: <code className="text-xs bg-muted px-1 py-0.5 rounded">{user?.id}</code></p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            
            <div className="space-y-2">
              <Label>Account ID</Label>
              <Input 
                value={user?.id || ''} 
                disabled 
                className="font-mono text-xs"
              />
            </div>
            
            <div className="pt-4">
              <Button 
                variant="outline" 
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">1. Add Your Kids</h4>
              <p className="text-sm text-muted-foreground">
                Go to the Kids tab to add family members with their names, ages, and colors.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">2. Create Task Templates</h4>
              <p className="text-sm text-muted-foreground">
                Set up recurring tasks like "Brush teeth" or "Make bed" with point values.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">3. Add Rewards</h4>
              <p className="text-sm text-muted-foreground">
                Create rewards your kids can redeem with their earned points.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">4. Generate Daily Tasks</h4>
              <p className="text-sm text-muted-foreground">
                Use the "Generate Today's Tasks" button to create daily task instances.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigTab;