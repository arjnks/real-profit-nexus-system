
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ShoppingCart, Users, Gift } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-realprofit-blue py-20">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1604719312566-8912e9667d9f?q=80&w=2000')] bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center lg:text-left lg:max-w-lg">
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              Welcome to <span className="text-realprofit-gold">Real Profit</span>
            </h1>
            <p className="mt-3 text-xl text-white opacity-90">
              Your trusted supermarket for quality products and incredible rewards
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Button asChild size="lg" className="bg-realprofit-gold hover:bg-realprofit-gold/90 text-black">
                <Link to="/shop">
                  Shop Now <ShoppingCart className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/register">
                  Register Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Real Profit?</h2>
            <p className="mt-4 text-xl text-gray-600">
              We offer more than just products. We offer a rewarding shopping experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition duration-300">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-realprofit-lightBlue flex items-center justify-center mb-6">
                  <ShoppingCart className="h-6 w-6 text-realprofit-blue" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Quality Products</h3>
                <p className="mt-2 text-gray-600">
                  We stock only the finest quality products from trusted brands and local producers.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition duration-300">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-realprofit-lightGreen flex items-center justify-center mb-6">
                  <Gift className="h-6 w-6 text-realprofit-green" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Rewarding Loyalty</h3>
                <p className="mt-2 text-gray-600">
                  Earn points with every purchase and enjoy exclusive benefits as you climb tiers.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition duration-300">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-realprofit-gold" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Community Growth</h3>
                <p className="mt-2 text-gray-600">
                  Join our unique MLM structure and earn as your network grows and shops with us.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Membership Tiers</h2>
            <p className="mt-4 text-xl text-gray-600">
              Unlock exclusive benefits as you move up our membership tiers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { name: 'Bronze', points: 100, color: 'bg-amber-700', discount: '10%' },
              { name: 'Silver', points: 500, color: 'bg-gray-400', discount: '20%' },
              { name: 'Gold', points: 1000, color: 'bg-yellow-500', discount: '30%' },
              { name: 'Platinum', points: 2000, color: 'bg-gray-700', discount: '50%' },
              { name: 'Diamond', points: 3000, color: 'bg-blue-500', discount: '70%' },
            ].map((tier) => (
              <Card key={tier.name} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition duration-300">
                <div className={`h-2 ${tier.color}`}></div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{tier.points} Points</p>
                  <div className="mt-4 text-center">
                    <span className="text-2xl font-bold text-realprofit-blue">{tier.discount}</span>
                    <span className="text-gray-600 text-sm"> point usage</span>
                  </div>
                  <Button asChild className="w-full mt-4" variant="outline">
                    <Link to={`/membership/${tier.name.toLowerCase()}`}>
                      Learn More
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-realprofit-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Ready to start your rewarding journey?</h2>
          <p className="mt-4 text-xl opacity-90">
            Join Real Profit today and experience shopping with benefits.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-realprofit-blue hover:bg-gray-100">
              <Link to="/register">
                Register Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/login">
                Login Now
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
