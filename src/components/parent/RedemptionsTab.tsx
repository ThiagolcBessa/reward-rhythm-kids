import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRedemptions, useDecideRedemption } from '@/hooks/use-parent-data';
import { format } from 'date-fns';
import { Check, X, Package, Star } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { useState, useEffect } from 'react';

const RedemptionsTab = () => {
  const { data: redemptions, isLoading } = useRedemptions();
  const decideRedemption = useDecideRedemption();
  const [showConfetti, setShowConfetti] = useState(false);
  
  const handleDecision = async (redemptionId: string, decision: 'approved' | 'rejected' | 'delivered') => {
    await decideRedemption.mutateAsync({ redemptionId, decision });
    
    if (decision === 'approved') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'approved': return 'default';
      case 'delivered': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return null;
    }
  };
  
  if (isLoading) {
    return <div>Loading redemptions...</div>;
  }
  
  const pendingRedemptions = redemptions?.filter(r => r.status === 'pending') || [];
  const completedRedemptions = redemptions?.filter(r => r.status !== 'pending') || [];
  
  return (
    <div className="space-y-6">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <div>
        <h2 className="text-2xl font-bold">Reward Redemptions</h2>
        <p className="text-muted-foreground">Manage your kids' reward requests</p>
      </div>
      
      {pendingRedemptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-3 h-3 bg-fun-orange rounded-full animate-pulse"></span>
              Pending Requests ({pendingRedemptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRedemptions.map(redemption => (
                <div key={redemption.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{redemption.reward.icon_emoji}</span>
                    <div>
                      <h4 className="font-medium">{redemption.kid.display_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        wants <span className="font-medium">{redemption.reward.title}</span>
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 text-fun-yellow" />
                        {redemption.reward.cost_points} points
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDecision(redemption.id, 'rejected')}
                      disabled={decideRedemption.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDecision(redemption.id, 'approved')}
                      disabled={decideRedemption.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {completedRedemptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kid</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedRedemptions.map(redemption => (
                  <TableRow key={redemption.id}>
                    <TableCell className="font-medium">
                      {redemption.kid.display_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{redemption.reward.icon_emoji}</span>
                        {redemption.reward.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-fun-yellow" />
                        {redemption.reward.cost_points}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(redemption.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(redemption.status)}
                          {redemption.status}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(redemption.requested_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {redemption.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecision(redemption.id, 'delivered')}
                          disabled={decideRedemption.isPending}
                        >
                          <Package className="h-4 w-4 mr-1" />
                          Mark Delivered
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {!redemptions?.length && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No redemptions yet</h3>
            <p className="text-muted-foreground text-center">
              When your kids redeem rewards, they'll appear here for approval
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RedemptionsTab;