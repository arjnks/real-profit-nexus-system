
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Crown, AlertCircle } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import type { LeaderboardEntry, LeaderboardConfig } from '@/types';
import { toast } from 'sonner';

interface LeaderboardProps {
  isAdmin?: boolean;
  showOffer?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ isAdmin = false, showOffer = true }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [config, setConfig] = useState<LeaderboardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, [isAdmin, showOffer]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching leaderboard data...');
      
      // Fetch leaderboard data
      const leaderboardData = await supabaseService.getLeaderboard(isAdmin ? undefined : 50);
      console.log('Leaderboard data received:', leaderboardData);
      setLeaderboard(leaderboardData || []);

      // Fetch config if needed
      if (showOffer) {
        const configData = await supabaseService.getLeaderboardConfig();
        console.log('Leaderboard config received:', configData);
        setConfig(configData);
      }
      
      toast.success('Leaderboard loaded successfully');
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setError('Failed to load leaderboard data');
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Award className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'bg-amber-100 text-amber-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Diamond': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isTopPerformer = (rank: number) => {
    return config && rank <= config.top_count;
  };

  const formatCurrency = (amount: number) => {
    return `₹${Number(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchLeaderboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showOffer && config && config.is_active && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              {config.offer_title}
            </CardTitle>
            <CardDescription className="text-yellow-700">
              {config.offer_description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                Top {config.top_count} get {config.offer_discount_percentage}% OFF
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Customer Leaderboard
          </CardTitle>
          <CardDescription>
            Ranked by total points earned from purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No customers found</p>
                <p className="text-sm">Start shopping to appear on the leaderboard!</p>
              </div>
            ) : (
              leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    isTopPerformer(entry.rank) 
                      ? 'border-yellow-200 bg-yellow-50 shadow-sm' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[60px]">
                      {getRankIcon(entry.rank)}
                      <span className="font-bold text-lg">#{entry.rank}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{entry.name}</h3>
                        <Badge variant="outline" className={getTierColor(entry.tier)}>
                          {entry.tier}
                        </Badge>
                        {isTopPerformer(entry.rank) && config && (
                          <Badge className="bg-yellow-500 text-white">
                            {config.offer_discount_percentage}% OFF
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Code: {entry.code}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg">{entry.points.toLocaleString()} pts</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(entry.total_spent)} spent
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
