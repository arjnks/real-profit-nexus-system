
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
  Check
} from 'lucide-react';

const MembershipBronze = () => {
  const benefits = [
    'Earn 1 point for every ₹5 spent',
    'Use up to 10% of product value as points',
    'Access to basic product catalog',
    'Monthly newsletters with tips',
    'Customer support via email',
    'Basic referral rewards'
  ];

  const requirements = [
    'Minimum 20 points to achieve Bronze club',
    'Complete profile verification',
    'Make at least one successful purchase'
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
            <Award className="h-10 w-10 text-amber-700" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bronze Membership</h1>
          <p className="text-xl text-gray-600">
            Start your journey with Real Profit and enjoy basic rewards and benefits
          </p>
        </div>

        {/* Club Badge */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-lg px-8 py-4 border border-amber-300">
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-amber-700" />
              <div>
                <h2 className="text-2xl font-bold text-amber-800">Bronze Club</h2>
                <p className="text-amber-700">Entry Level • 20-39 Points</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-amber-500" />
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
                <Users className="h-5 w-5 mr-2 text-amber-500" />
                How to Achieve Bronze
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <ArrowRight className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> All new members start at Bronze club automatically upon registration and first purchase.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Club Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ready to Level Up?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Silver Club Benefits</h3>
                <p className="text-gray-600">Unlock better rewards with 40+ points</p>
                <ul className="mt-2 text-sm text-gray-500">
                  <li>• Use up to 20% of product value as points</li>
                  <li>• Priority customer support</li>
                  <li>• Exclusive Silver club offers</li>
                </ul>
              </div>
              <Button asChild>
                <Link to="/membership/silver">
                  View Silver Club
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Your Bronze Journey Today</h2>
          <p className="text-gray-600 mb-8">
            Join thousands of satisfied customers enjoying Real Profit benefits
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/register">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Join Now
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

export default MembershipBronze;
