
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Gift, Users, Star, Target } from 'lucide-react';
import { toast } from 'sonner';

interface SimpleReferralSystemProps {
  customerCode: string;
}

const SimpleReferralSystem: React.FC<SimpleReferralSystemProps> = ({ customerCode }) => {
  const { customers, canAddReferral, addReferral, getMLMStatistics } = useData();
  const [friendCode, setFriendCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customer = customers.find(c => c.code === customerCode);
  const stats = getMLMStatistics(customerCode);

  const handleReferFriend = async () => {
    if (!friendCode.trim()) {
      toast.error('Please enter your friend\'s code');
      return;
    }

    if (friendCode === customerCode) {
      toast.error('You cannot refer yourself');
      return;
    }

    if (!canAddReferral(customerCode)) {
      toast.error('You have reached the maximum number of referrals (5)');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await addReferral(customerCode, friendCode);
      if (success) {
        toast.success('Friend successfully added to your referral network!');
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

  if (!customer) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Invite Friends & Earn Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{stats.directReferrals}</div>
              <div className="text-sm text-blue-700">Friends Referred</div>
              <div className="text-xs text-blue-600 mt-1">Max: 5</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{customer.points}</div>
              <div className="text-sm text-green-700">Reward Points</div>
              <div className="text-xs text-green-600 mt-1">From shopping & referrals</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">{customer.miniCoins}</div>
              <div className="text-sm text-orange-700">Bonus Coins</div>
              <div className="text-xs text-orange-600 mt-1">5 coins = 1 point</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Refer a Friend</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter friend's customer code (e.g., A123)"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                disabled={isSubmitting || stats.directReferrals >= 5}
                className="flex-1"
              />
              <Button 
                onClick={handleReferFriend}
                disabled={isSubmitting || stats.directReferrals >= 5}
              >
                {isSubmitting ? 'Adding...' : 'Refer Friend'}
              </Button>
            </div>
            
            {stats.directReferrals >= 5 && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                You've reached the maximum number of referrals. Great job building your network!
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">How Rewards Work:</h5>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Earn points for every purchase you make</li>
              <li>• Get bonus coins when friends in your network shop</li>
              <li>• 5 bonus coins automatically convert to 1 reward point</li>
              <li>• Use points to get discounts on future purchases</li>
              <li>• Refer up to 5 friends to maximize your rewards</li>
            </ul>
          </div>

          {stats.directReferrals > 0 && (
            <div>
              <h5 className="font-medium mb-2">Your Referral Network</h5>
              <div className="flex flex-wrap gap-2">
                {customers
                  .filter(c => c.parentCode === customerCode)
                  .map(friend => (
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

export default SimpleReferralSystem;
