import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Users, Gift, CheckSquare } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-fun-yellow/10 via-fun-blue/10 to-fun-purple/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-fun-purple mb-4">
            Reward Rhythm Kids
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform daily tasks into fun adventures! Motivate your kids with a points-based reward system.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/parent">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/auth">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CheckSquare className="h-12 w-12 text-fun-green mx-auto mb-4" />
              <CardTitle>Daily Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create custom task templates and generate daily tasks for each kid
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Star className="h-12 w-12 text-fun-yellow mx-auto mb-4" />
              <CardTitle>Points System</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Kids earn points for completed tasks and can track their progress
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Gift className="h-12 w-12 text-fun-orange mx-auto mb-4" />
              <CardTitle>Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Set up custom rewards that kids can redeem with their earned points
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-fun-purple mx-auto mb-4" />
              <CardTitle>Family Friendly</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage multiple kids with personalized dashboards and progress tracking
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Join families who are making chores fun and rewarding!
          </p>
          {!user && (
            <Button asChild size="lg">
              <Link to="/auth">Create Your Family Account</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
