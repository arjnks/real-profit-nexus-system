
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Star, 
  ShoppingBag, 
  Users,
  ArrowRight,
  Check,
  Crown,
  Gem
} from 'lucide-react';

const MembershipGold = () => {
  const benefits = [
    'Earn 1 point for every ₹5 spent',
    'Use up to 30% of product value as points',
    'Access to exclusive Gold product catalog',
    'VIP customer support with dedicated agent',
    'Exclusive Gold tier offers and early access',
    'Premium referral rewards and bonuses',
    'Monthly VIP newsletter with insider tips',
    'Invitation to exclusive member events',
    'Free shipping on all orders',
    'Birthday and anniversary special discounts'
  ];

  const requirements = [
    'Accumulate 80-159 points total',
    'Maintain consistent monthly activity',
    'Complete premium member verification',
    'Refer at least 2 active members'
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
            <Gem className="h-10 w-10 text-yellow-700" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Gold Membership</h1>
          <p className="text-xl text-gray-600">
            Experience premium benefits and VIP treatment with Gold tier
          </p>
        </div>

        {/* Tier Badge */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg px-8 py-4 border border-yellow-300">
            <div className="flex items-center space-x-3">
              <Gem className="h-8 w-8 text-yellow-700" />
              <div>
                <h2 className="text-2xl font-bold text-yellow-800">Gold Tier</h2>
                <p className="text-yellow-700">Premium Level • 80-159 Points</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Premium Benefits & Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-yellow-500" />
                How to Achieve Gold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <ArrowRight className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Elite Status:</strong> Gold members enjoy VIP treatment and are eligible for our exclusive member events and special promotions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tier Comparison */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Gold vs Lower Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2">Feature</th>
                    <th className="pb-2 text-amber-700">Bronze</th>
                    <th className="pb-2 text-gray-700">Silver</th>
                    <th className="pb-2 text-yellow-700">Gold</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Points Usage</td>
                    <td className="py-2 text-amber-700">Up to 10%</td>
                    <td className="py-2 text-gray-700">Up to 20%</td>
                    <td className="py-2 text-yellow-700 font-semibold">Up to 30%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Customer Support</td>
                    <td className="py-2 text-amber-700">Email</td>
                    <td className="py-2 text-gray-700">Priority</td>
                    <td className="py-2 text-yellow-700 font-semibold">VIP Dedicated</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Shipping</td>
                    <td className="py-2 text-amber-700">Standard rates</td>
                    <td className="py-2 text-gray-700">Standard rates</td>
                    <td className="py-2 text-yellow-700 font-semibold">FREE shipping</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Exclusive Events</td>
                    <td className="py-2 text-amber-700">❌</td>
                    <td className="py-2 text-gray-700">❌</td>
                    <td className="py-2 text-yellow-700 font-semibold">✅ VIP Access</td>
                  </tr>
                  <tr>
                    <td className="py-2">Referral Rewards</td>
                    <td className="py-2 text-amber-700">Basic</td>
                    <td className="py-2 text-gray-700">Enhanced</td>
                    <td className="py-2 text-yellow-700 font-semibold">Premium</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Exclusive Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Gold Exclusive Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Crown className="h-6 w-6 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">VIP Treatment</h3>
                  <p className="text-gray-600 text-sm">Dedicated support agent and priority handling for all your needs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="h-6 w-6 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Exclusive Events</h3>
                  <p className="text-gray-600 text-sm">Invitation-only member events and product launches</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Gem className="h-6 w-6 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Premium Catalog</h3>
                  <p className="text-gray-600 text-sm">Access to exclusive Gold-tier products and limited editions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ShoppingBag className="h-6 w-6 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Free Shipping</h3>
                  <p className="text-gray-600 text-sm">Complimentary shipping on all orders, no minimum purchase</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Tier Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>The Ultimate: Diamond Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Diamond Tier Benefits</h3>
                <p className="text-gray-600">Unlock the ultimate experience with 160+ points</p>
                <ul className="mt-2 text-sm text-gray-500">
                  <li>• Use up to 70% of product value as points</li>
                  <li>• Personal shopping assistant</li>
                  <li>• Exclusive Diamond member privileges</li>
                  <li>• Highest tier referral commissions</li>
                </ul>
              </div>
              <Button asChild>
                <Link to="/membership/diamond">
                  View Diamond Tier
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Achieve Gold Status Today</h2>
          <p className="text-gray-600 mb-8">
            Join the elite group of Gold members and enjoy premium benefits
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/register">
                <Gem className="h-4 w-4 mr-2" />
                Start Your Journey
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/shop">Browse Premium Products</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MembershipGold;
