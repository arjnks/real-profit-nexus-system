
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import type { LeaderboardEntry, LeaderboardConfig } from '@/types';

interface LeaderboardProps {
  isAdmin?: boolean;
  showOffer?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ isAdmin = false, showOffer = true }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [config, setConfig] = useState<LeaderboardConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    if (showOffer) {
      fetchConfig();
    }
  }, [showOffer]);

  const fetchLeaderboard = async () => {
    try {
      const data = await supabaseService.getLeaderboard(isAdmin ? undefined : 50);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const configData = await supabaseService.getLeaderboardConfig();
      setConfig(configData);
    } catch (error) {
      console.error('Error fetching leaderboard config:', error);
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">Loading leaderboard...</div>
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
                No customers found
              </div>
            ) : (
              leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    isTopPerformer(entry.rank) ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
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
                      ₹{entry.total_spent.toFixed(2)} spent
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
