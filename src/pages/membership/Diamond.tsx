
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
  Gem,
  Diamond,
  Sparkles
} from 'lucide-react';

const MembershipDiamond = () => {
  const benefits = [
    'Earn 1 point for every ₹5 spent',
    'Use up to 70% of product value as points',
    'Access to exclusive Diamond product catalog',
    'Personal shopping assistant and concierge service',
    'Ultra-exclusive Diamond tier offers and first access',
    'Maximum referral rewards and leadership bonuses',
    'VIP monthly newsletter with market insights',
    'Exclusive access to Diamond member events and retreats',
    'Free express shipping and priority delivery',
    'Personal account manager for all your needs',
    'Annual Diamond member appreciation gifts',
    'Invitation to Real Profit leadership council'
  ];

  const requirements = [
    'Accumulate 160+ points total',
    'Maintain top-tier monthly activity',
    'Complete Diamond elite verification',
    'Lead a team of at least 5 active referrals',
    'Demonstrate leadership in the community'
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Diamond className="h-10 w-10 text-blue-700" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Diamond Membership</h1>
          <p className="text-xl text-gray-600">
            The pinnacle of Real Profit membership - ultimate benefits and exclusive privileges
          </p>
        </div>

        {/* Tier Badge */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-blue-100 rounded-lg px-8 py-4 border border-blue-300">
            <div className="flex items-center space-x-3">
              <Diamond className="h-8 w-8 text-blue-700" />
              <div>
                <h2 className="text-2xl font-bold text-blue-800">Diamond Tier</h2>
                <p className="text-blue-700">Ultimate Level • 160+ Points</p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Benefits */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
                Ultimate Benefits & Privileges
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
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="h-5 w-5 mr-2 text-blue-500" />
                How to Achieve Diamond
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <ArrowRight className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Elite Recognition:</strong> Diamond members represent the pinnacle of Real Profit success and enjoy unmatched privileges and recognition.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complete Tier Comparison */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Complete Tier Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2">Feature</th>
                    <th className="pb-2 text-amber-700">Bronze</th>
                    <th className="pb-2 text-gray-700">Silver</th>
                    <th className="pb-2 text-yellow-700">Gold</th>
                    <th className="pb-2 text-blue-700">Diamond</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Points Usage</td>
                    <td className="py-2 text-amber-700">10%</td>
                    <td className="py-2 text-gray-700">20%</td>
                    <td className="py-2 text-yellow-700">30%</td>
                    <td className="py-2 text-blue-700 font-bold">70%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Support Level</td>
                    <td className="py-2 text-amber-700">Email</td>
                    <td className="py-2 text-gray-700">Priority</td>
                    <td className="py-2 text-yellow-700">VIP</td>
                    <td className="py-2 text-blue-700 font-bold">Personal Assistant</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Shipping</td>
                    <td className="py-2 text-amber-700">Standard</td>
                    <td className="py-2 text-gray-700">Standard</td>
                    <td className="py-2 text-yellow-700">Free</td>
                    <td className="py-2 text-blue-700 font-bold">Free Express</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Events Access</td>
                    <td className="py-2 text-amber-700">❌</td>
                    <td className="py-2 text-gray-700">❌</td>
                    <td className="py-2 text-yellow-700">VIP Events</td>
                    <td className="py-2 text-blue-700 font-bold">Exclusive Retreats</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Account Manager</td>
                    <td className="py-2 text-amber-700">❌</td>
                    <td className="py-2 text-gray-700">❌</td>
                    <td className="py-2 text-yellow-700">❌</td>
                    <td className="py-2 text-blue-700 font-bold">✅ Personal</td>
                  </tr>
                  <tr>
                    <td className="py-2">Leadership Council</td>
                    <td className="py-2 text-amber-700">❌</td>
                    <td className="py-2 text-gray-700">❌</td>
                    <td className="py-2 text-yellow-700">❌</td>
                    <td className="py-2 text-blue-700 font-bold">✅ Member</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Diamond Exclusive Features */}
        <Card className="mt-8 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Diamond className="h-5 w-5 mr-2 text-blue-500" />
              Diamond Exclusive Privileges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Crown className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Personal Shopping Assistant</h3>
                  <p className="text-gray-600 text-sm">Dedicated assistant for personalized shopping recommendations and orders</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Leadership Council</h3>
                  <p className="text-gray-600 text-sm">Exclusive membership in Real Profit's strategic leadership council</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Sparkles className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Annual Appreciation Gifts</h3>
                  <p className="text-gray-600 text-sm">Luxury gifts and exclusive merchandise as tokens of appreciation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Exclusive Retreats</h3>
                  <p className="text-gray-600 text-sm">All-expenses-paid retreats and networking events with top members</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diamond Member Benefits */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle>Why Diamond Members Choose Real Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Diamond className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Ultimate Savings</h3>
                <p className="text-sm text-gray-600">Use up to 70% points for purchases - unmatched savings potential</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Elite Recognition</h3>
                <p className="text-sm text-gray-600">Recognition as a top-tier member with exclusive status and privileges</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Leadership Platform</h3>
                <p className="text-sm text-gray-600">Platform to influence Real Profit's future and mentor other members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Achieve Diamond Excellence</h2>
          <p className="text-gray-600 mb-8">
            Join the most elite tier of Real Profit membership and unlock unprecedented benefits
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link to="/register">
                <Diamond className="h-4 w-4 mr-2" />
                Begin Your Diamond Journey
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/shop">Explore Exclusive Products</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MembershipDiamond;
