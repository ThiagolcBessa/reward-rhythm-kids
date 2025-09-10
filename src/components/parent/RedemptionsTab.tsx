import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useRedemptions, useDecideRedemption } from '@/hooks/use-parent-data';
import { format } from 'date-fns';
import { Check, X, Package, Star, Clock, Gift, AlertCircle } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const RedemptionsTab = () => {
  const { data: redemptions, isLoading } = useRedemptions();
  const decideRedemption = useDecideRedemption();
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  
  const handleDecision = async (redemptionId: string, decision: 'approved' | 'rejected' | 'delivered') => {
    try {
      await decideRedemption.mutateAsync({ redemptionId, decision });
      
      if (decision === 'approved') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (error) {
      // Error is handled by the mutation hook's onError
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
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <Check className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return null;
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const pendingRedemptions = redemptions?.filter(r => r.status === 'pending') || [];
  const approvedRedemptions = redemptions?.filter(r => r.status === 'approved') || [];
  const completedRedemptions = redemptions?.filter(r => r.status === 'delivered' || r.status === 'rejected') || [];
  
  return (
    <div className="space-y-6">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-fun-purple/10 to-fun-blue/10 rounded-2xl p-6 border border-fun-purple/20">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="h-8 w-8 text-fun-purple" />
          <h2 className="text-3xl font-bold text-gray-800">Reward Redemptions</h2>
        </div>
        <p className="text-muted-foreground">Manage your kids' reward requests and track their progress</p>
        
        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <div className="bg-white/60 rounded-xl px-4 py-2 border border-white/80">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-fun-orange" />
              <span className="text-sm font-medium">{pendingRedemptions.length} Pending</span>
            </div>
          </div>
          <div className="bg-white/60 rounded-xl px-4 py-2 border border-white/80">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-fun-green" />
              <span className="text-sm font-medium">{approvedRedemptions.length} Approved</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pending Requests */}
      {pendingRedemptions.length > 0 && (
        <Card className="border-l-4 border-l-fun-orange shadow-lg">
          <CardHeader className="bg-fun-orange/5">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-fun-orange rounded-full animate-pulse"></div>
                <AlertCircle className="h-5 w-5 text-fun-orange" />
              </div>
              Pending Requests ({pendingRedemptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="font-bold">Kid</TableHead>
                    <TableHead className="font-bold">Reward</TableHead>
                    <TableHead className="font-bold">Cost</TableHead>
                    <TableHead className="font-bold">Requested</TableHead>
                    <TableHead className="font-bold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRedemptions.map(redemption => (
                    <TableRow key={redemption.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-lg">
                        {redemption.kid.display_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{redemption.reward.icon_emoji}</span>
                          <div>
                            <p className="font-medium">{redemption.reward.title}</p>
                            <p className="text-sm text-muted-foreground">Reward redemption</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 bg-fun-yellow/20 px-3 py-1 rounded-full w-fit">
                          <Star className="h-4 w-4 text-fun-yellow" />
                          <span className="font-bold">{redemption.reward.cost_points}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(redemption.requested_at), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDecision(redemption.id, 'rejected')}
                            disabled={decideRedemption.isPending}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDecision(redemption.id, 'approved')}
                            disabled={decideRedemption.isPending}
                            className="bg-fun-green hover:bg-fun-green/90 text-white shadow-lg"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {pendingRedemptions.map(redemption => (
                <Card key={redemption.id} className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{redemption.reward.icon_emoji}</span>
                          <div>
                            <h3 className="font-bold text-lg">{redemption.kid.display_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Requested {format(new Date(redemption.requested_at), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-fun-orange/20 text-fun-orange border-fun-orange/30">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>

                      {/* Reward Details */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="font-medium text-gray-800 mb-1">{redemption.reward.title}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-fun-yellow" />
                          <span className="font-bold text-fun-yellow">{redemption.reward.cost_points} points</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecision(redemption.id, 'rejected')}
                          disabled={decideRedemption.isPending}
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDecision(redemption.id, 'approved')}
                          disabled={decideRedemption.isPending}
                          className="flex-1 bg-fun-green hover:bg-fun-green/90 text-white shadow-lg"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Approved - Ready for Delivery */}
      {approvedRedemptions.length > 0 && (
        <Card className="border-l-4 border-l-fun-green">
          <CardHeader className="bg-fun-green/5">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Check className="h-5 w-5 text-fun-green" />
              Ready for Delivery ({approvedRedemptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {approvedRedemptions.map(redemption => (
                <div key={redemption.id} className="flex items-center justify-between p-4 bg-fun-green/5 border border-fun-green/20 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{redemption.reward.icon_emoji}</span>
                    <div>
                      <h4 className="font-bold text-lg">{redemption.kid.display_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-fun-green">Approved:</span> {redemption.reward.title}
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 text-fun-yellow" />
                        <span className="font-medium">{redemption.reward.cost_points} points</span>
                        <span className="text-muted-foreground">• {format(new Date(redemption.decided_at || redemption.requested_at), 'MMM d')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleDecision(redemption.id, 'delivered')}
                    disabled={decideRedemption.isPending}
                    className="bg-fun-blue hover:bg-fun-blue/90 text-white shadow-lg"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Mark Delivered
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Completed History */}
      {completedRedemptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kid</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedRedemptions.slice(0, 10).map(redemption => (
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
                        {format(new Date(redemption.decided_at || redemption.requested_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {completedRedemptions.slice(0, 5).map(redemption => (
                <div key={redemption.id} className="p-4 border rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{redemption.reward.icon_emoji}</span>
                      <span className="font-medium">{redemption.kid.display_name}</span>
                    </div>
                    <Badge variant={getStatusColor(redemption.status)} className="text-xs">
                      {getStatusIcon(redemption.status)}
                      {redemption.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{redemption.reward.title}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-fun-yellow" />
                      {redemption.reward.cost_points} points
                    </div>
                    <span>{format(new Date(redemption.decided_at || redemption.requested_at), 'MMM d')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Empty State */}
      {!redemptions?.length && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-gradient-to-br from-fun-purple/10 to-fun-blue/10 rounded-full p-6 mb-6">
              <Package className="h-12 w-12 text-fun-purple" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-gray-800">No redemptions yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              When your kids redeem rewards, they'll appear here for approval. Encourage them to complete tasks and earn points!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RedemptionsTab;