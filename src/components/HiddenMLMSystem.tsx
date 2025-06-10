
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useMLM } from '@/contexts/MLMContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gift, Users, Star, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface HiddenMLMSystemProps {
  customerCode: string;
}

const HiddenMLMSystem: React.FC<HiddenMLMSystemProps> = ({ customerCode }) => {
  const { customers, canAddReferral, addReferral } = useData();
  const { getMLMStructure, validateMLMStructure, getMLMEarnings } = useMLM();
  const [friendCode, setFriendCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customer = customers.find(c => c.code === customerCode);
  const mlmStructure = getMLMStructure(customerCode);

  if (!customer) return null;

  const handleInviteFriend = async () => {
    if (!friendCode.trim()) {
      toast.error('Please enter your friend\'s code');
      return;
    }

    if (friendCode === customerCode) {
      toast.error('You cannot refer yourself');
      return;
    }

    if (!validateMLMStructure(customerCode)) {
      toast.error('You have reached the maximum number of referrals (5)');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await addReferral(customerCode, friendCode);
      if (success) {
        toast.success('Friend successfully added to your network!');
        setFriendCode('');
      } else {
        toast.error('Unable to add referral. Please check the friend\'s code.');
      }
    } catch (error) {
      toast.error('An error occurred while adding the referral');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate potential earnings
  const calculatePotentialEarnings = () => {
    const level1 = 5; // 5 direct referrals
    const level2 = 25; // 5 x 5
    const level3 = 125; // 25 x 5
    const level4 = 625; // 125 x 5
    const level5 = 3125; // 625 x 5
    const level6 = 15625; // 3125 x 5

    return { level1, level2, level3, level4, level5, level6 };
  };

  const potentialEarnings = calculatePotentialEarnings();
  const directReferrals = customers.filter(c => c.parentCode === customerCode);

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
              <div className="text-xs text-blue-600 mt-1">Earn from shopping & friends</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{directReferrals.length}/5</div>
              <div className="text-sm text-green-700">Friends Invited</div>
              <div className="text-xs text-green-600 mt-1">Invite more to earn bonus points</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">{customer.miniCoins}</div>
              <div className="text-sm text-orange-700">Bonus Coins</div>
              <div className="text-xs text-orange-600 mt-1">From friend activities</div>
            </div>
          </div>

          {/* Invite Friend Section */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Invite Friends & Earn More Points</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter friend's customer code (e.g., A123)"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                disabled={isSubmitting || directReferrals.length >= 5}
                className="flex-1"
              />
              <Button 
                onClick={handleInviteFriend}
                disabled={isSubmitting || directReferrals.length >= 5}
              >
                {isSubmitting ? 'Adding...' : 'Invite'}
              </Button>
            </div>
            
            {directReferrals.length >= 5 && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                You've invited the maximum number of friends. Great job building your network!
              </div>
            )}
          </div>

          {/* Progress Visualization */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3">Your Network Progress</h5>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Friends Invited</span>
                  <span>{directReferrals.length}/5</span>
                </div>
                <Progress value={(directReferrals.length / 5) * 100} className="h-2" />
              </div>
              
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Earn 1 point for every ₹5 your friends spend</div>
                <div>• Points from your friends' friends too!</div>
                <div>• Build a network of up to 6 levels deep</div>
                <div>• More friends = more points automatically</div>
              </div>
            </div>
          </div>

          {/* Potential Earnings Display (Hidden MLM Structure) */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Earning Potential
            </h5>
            <div className="text-sm text-blue-800 space-y-1">
              <p>When you invite 5 friends who each spend ₹5, you earn <strong>5 points</strong></p>
              <p>If they each invite 5 friends (25 total), you earn <strong>25 more points</strong></p>
              <p>This continues for 6 levels - the more active your network, the more you earn!</p>
            </div>
          </div>

          {/* Current Friends List */}
          {directReferrals.length > 0 && (
            <div>
              <h5 className="font-medium mb-2">Your Invited Friends</h5>
              <div className="flex flex-wrap gap-2">
                {directReferrals.map(friend => (
                  <Badge key={friend.id} variant="outline" className="text-xs">
                    {friend.name} ({friend.code})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HiddenMLMSystem;
