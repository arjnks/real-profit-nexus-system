
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useMLM } from '@/contexts/MLMContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gift, Award, Star, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useMLMCalculations } from '@/hooks/useMLMCalculations';

interface HiddenMLMSystemProps {
  customerCode: string;
}

const HiddenMLMSystem: React.FC<HiddenMLMSystemProps> = ({ customerCode }) => {
  const { customers } = useData();
  const { getMLMStructure } = useMLM();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mlmStats = useMLMCalculations(customerCode);

  const customer = customers.find(c => c.code === customerCode);
  const mlmStructure = getMLMStructure(customerCode);

  if (!customer) return null;

  // Calculate potential earnings
  const calculatePotentialEarnings = () => {
    const level1 = 5; // level 1 has 1 slot (admin)
    const level2 = 25; // level 2 has 5 slots
    const level3 = 125; // level 3 has 25 slots
    const level4 = 625; // level 4 has 125 slots
    const level5 = 3125; // level 5 has 625 slots
    const level6 = 15625; // level 6 has 3125 slots

    return { level1, level2, level3, level4, level5, level6 };
  };

  const potentialEarnings = calculatePotentialEarnings();
  
  // Calculate customer's level stats
  const getLevelInfo = () => {
    const level = customer.mlmLevel || 1;
    const levelCapacities = {
      1: 1, // Admin level
      2: 5,
      3: 25,
      4: 125,
      5: 625,
      6: 3125
    };
    
    const customersAtSameLevel = customers.filter(c => c.mlmLevel === level).length;
    const capacity = levelCapacities[level as keyof typeof levelCapacities];
    const progress = (customersAtSameLevel / capacity) * 100;
    
    return {
      level,
      customersAtSameLevel,
      capacity,
      progress
    };
  };
  
  const levelInfo = getLevelInfo();

  return (
    <div className="space-y-6">
      {/* Loyalty Program Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Loyalty Rewards Program
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{customer.points}</div>
              <div className="text-sm text-blue-700">Loyalty Points</div>
              <div className="text-xs text-blue-600 mt-1">Earn from shopping & system rewards</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">Level {customer.mlmLevel || 1}</div>
              <div className="text-sm text-green-700">Loyalty Level</div>
              <div className="text-xs text-green-600 mt-1">Higher levels earn more rewards</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">{customer.miniCoins}</div>
              <div className="text-sm text-orange-700">Bonus Coins</div>
              <div className="text-xs text-orange-600 mt-1">From system activities</div>
            </div>
          </div>

          {/* Level Progress Visualization */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3">Your Loyalty Progress</h5>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Level {levelInfo.level} Progress</span>
                  <span>{levelInfo.customersAtSameLevel}/{levelInfo.capacity}</span>
                </div>
                <Progress value={levelInfo.progress} className="h-2" />
              </div>
              
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Earn 1 point for every ₹5 you spend</div>
                <div>• More points = higher loyalty tier</div>
                <div>• Higher tiers get more rewards and discounts</div>
                <div>• Points can be redeemed for purchases</div>
              </div>
            </div>
          </div>

          {/* Potential Earnings Display (Hidden MLM Structure) */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Loyalty Rewards Potential
            </h5>
            <div className="text-sm text-blue-800 space-y-1">
              <p>Every ₹5 spent in our store = <strong>1 loyalty point</strong></p>
              <p>Reach higher tiers: Bronze (12 pts), Silver (40 pts), Gold (80 pts), Diamond (160 pts)</p>
              <p>Higher tiers receive bigger discounts and exclusive offers!</p>
            </div>
          </div>

          {/* MLM Stats */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="font-medium text-purple-900 mb-2">Your Loyalty Network Stats</h5>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-sm text-purple-700">Total Network Size:</span>
                <p className="text-lg font-semibold text-purple-900">{mlmStats.totalNetworkSize}</p>
              </div>
              <div>
                <span className="text-sm text-purple-700">Total Earnings:</span>
                <p className="text-lg font-semibold text-purple-900">{mlmStats.totalEarnings}</p>
              </div>
            </div>

            {Object.keys(mlmStats.levelStats).length > 0 && (
              <div className="mt-3">
                <h6 className="text-sm font-medium text-purple-800 mb-2">Earnings by Level:</h6>
                <div className="space-y-1">
                  {Object.entries(mlmStats.levelStats).map(([level, { count, earnings }]) => (
                    <div key={level} className="flex justify-between text-xs">
                      <span>Level {level}:</span>
                      <span>{count} members, {earnings} points earned</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HiddenMLMSystem;
