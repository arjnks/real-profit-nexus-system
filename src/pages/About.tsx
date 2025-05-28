
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Users, 
  ShoppingBag, 
  Trophy,
  Target,
  Heart,
  Star
} from 'lucide-react';

const About = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Real Profit</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing the shopping experience with our innovative MLM-based reward system, 
            offering quality products while helping our customers build sustainable income streams.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-12 w-12 text-realprofit-blue mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">1000+</h3>
              <p className="text-gray-600">Happy Customers</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <ShoppingBag className="h-12 w-12 text-realprofit-green mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">500+</h3>
              <p className="text-gray-600">Quality Products</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Award className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">4</h3>
              <p className="text-gray-600">Membership Tiers</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <Trophy className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">98%</h3>
              <p className="text-gray-600">Satisfaction Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-6 w-6 mr-2 text-realprofit-blue" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                To provide high-quality products at competitive prices while empowering our customers 
                to build additional income through our innovative multi-level marketing system. We believe 
                in creating win-win situations where shopping becomes an investment in your future.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-6 w-6 mr-2 text-realprofit-green" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                To become the leading platform that transforms traditional shopping into a rewarding 
                experience, where every purchase contributes to building a sustainable income stream 
                for our community members while delivering exceptional value and service.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <Heart className="h-6 w-6 mr-2 text-red-500" />
              Our Core Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Quality First</h3>
                <p className="text-gray-600">
                  We never compromise on product quality and ensure every item meets our high standards.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Transparency</h3>
                <p className="text-gray-600">
                  Clear communication, honest pricing, and transparent reward systems build trust.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Community</h3>
                <p className="text-gray-600">
                  Building a supportive community where everyone can grow and succeed together.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join Our Community?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Start your journey with Real Profit today and discover the benefits of smart shopping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/register">Join Now</Link>
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

export default About;
