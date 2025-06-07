
import React from 'react';
import Layout from '@/components/Layout';
import ClubTierDisplay from '@/components/ClubTierDisplay';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Users, Award, Leaf } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-realprofit-blue to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to RealProfit
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Your gateway to exclusive products, services, and rewards
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" className="bg-white text-realprofit-blue hover:bg-gray-100">
              <a href="/shop">Shop Now</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-realprofit-blue">
              <a href="/register">Join Club</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Club Tier Benefits */}
      <ClubTierDisplay />

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RealProfit?</h2>
            <p className="text-lg text-gray-600">Discover the benefits of being part of our community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-realprofit-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-gray-600">Curated selection of premium products at competitive prices</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-realprofit-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rewards Program</h3>
              <p className="text-gray-600">Earn points with every purchase and redeem for exciting rewards</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-realprofit-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600">Join a thriving community of like-minded individuals</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-realprofit-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sustainable</h3>
              <p className="text-gray-600">Committed to environmental responsibility and ethical practices</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of satisfied customers and start earning rewards today
          </p>
          <Button asChild size="lg" className="bg-realprofit-blue hover:bg-blue-600">
            <a href="/register">Sign Up Now</a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
