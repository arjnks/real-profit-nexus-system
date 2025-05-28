
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
  Crown
} from 'lucide-react';

const MembershipSilver = () => {
  const benefits = [
    'Earn 1 point for every ₹5 spent',
    'Use up to 20% of product value as points',
    'Access to premium product catalog',
    'Priority customer support',
    'Exclusive Silver tier offers and discounts',
    'Enhanced referral rewards',
    'Monthly exclusive deals newsletter',
    'Early access to new products'
  ];

  const requirements = [
    'Accumulate 40-79 points total',
    'Maintain active shopping status',
    'Complete advanced profile verification'
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <Crown className="h-10 w-10 text-gray-700" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Silver Membership</h1>
          <p className="text-xl text-gray-600">
            Unlock enhanced benefits and priority support with Silver tier
          </p>
        </div>

        {/* Tier Badge */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg px-8 py-4 border border-gray-300">
            <div className="flex items-center space-x-3">
              <Crown className="h-8 w-8 text-gray-700" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Silver Tier</h2>
                <p className="text-gray-700">Intermediate Level • 40-79 Points</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-gray-500" />
                Benefits & Rewards
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
                <Users className="h-5 w-5 mr-2 text-gray-500" />
                How to Achieve Silver
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <ArrowRight className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-800">
                  <strong>Upgrade from Bronze:</strong> Continue shopping and earning points to reach the 40-point threshold for automatic Silver upgrade.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison with Bronze */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Silver vs Bronze Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2">Feature</th>
                    <th className="pb-2 text-amber-700">Bronze</th>
                    <th className="pb-2 text-gray-700">Silver</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b">
                    <td className="py-2">Points Usage</td>
                    <td className="py-2 text-amber-700">Up to 10%</td>
                    <td className="py-2 text-gray-700 font-semibold">Up to 20%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Customer Support</td>
                    <td className="py-2 text-amber-700">Email only</td>
                    <td className="py-2 text-gray-700 font-semibold">Priority support</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Exclusive Offers</td>
                    <td className="py-2 text-amber-700">Basic</td>
                    <td className="py-2 text-gray-700 font-semibold">Premium Silver offers</td>
                  </tr>
                  <tr>
                    <td className="py-2">Product Access</td>
                    <td className="py-2 text-amber-700">Standard catalog</td>
                    <td className="py-2 text-gray-700 font-semibold">Premium catalog</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Next Tier Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ready for Gold Tier?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gold Tier Benefits</h3>
                <p className="text-gray-600">Unlock premium rewards with 80+ points</p>
                <ul className="mt-2 text-sm text-gray-500">
                  <li>• Use up to 30% of product value as points</li>
                  <li>• VIP customer support</li>
                  <li>• Exclusive Gold member events</li>
                  <li>• Higher referral commissions</li>
                </ul>
              </div>
              <Button asChild>
                <Link to="/membership/gold">
                  View Gold Tier
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upgrade to Silver Today</h2>
          <p className="text-gray-600 mb-8">
            Enjoy enhanced benefits and priority support with Silver membership
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/register">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Start Shopping
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/shop">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MembershipSilver;
