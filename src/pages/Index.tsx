import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useMyKids } from '@/hooks/use-parent-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const { data: kids, isLoading } = useMyKids();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fun-yellow/10 via-fun-blue/10 to-fun-purple/10">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-fun-purple mb-4">
              Reward Rhythm Kids
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform daily tasks into fun adventures! Motivate your kids with a points-based reward system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/login">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fun-yellow/10 via-fun-blue/10 to-fun-purple/10">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-fun-purple mb-2">
            Choose Your Kid
          </h1>
          <p className="text-lg text-muted-foreground">
            Select a kid to view their dashboard
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        ) : kids && kids.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {kids.map((kid) => (
              <Link 
                key={kid.id} 
                to={`/kid/${kid.id}`}
                className="block transition-transform hover:scale-105"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-200 border-2 hover:border-fun-purple/30">
                  <CardHeader className="text-center pb-4">
                    <div 
                      className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-4"
                      style={{ backgroundColor: kid.color_hex || '#8B5CF6' }}
                    >
                      {kid.avatar_url ? (
                        <img 
                          src={kid.avatar_url} 
                          alt={kid.display_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        kid.display_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {kid.display_name}
                    </CardTitle>
                    {kid.age && (
                      <p className="text-sm text-muted-foreground">
                        {kid.age} years old
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Tap to view dashboard
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center mb-8">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-muted-foreground mb-4">
                No kids found. Set up your family first!
              </p>
              <Button asChild>
                <Link to="/parent">Go to Parent Dashboard</Link>
              </Button>
            </div>
          </div>
        )}

        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/parent">
              <Settings className="h-4 w-4" />
              Parent Mode
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
