
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import ClubTierDisplay from '@/components/ClubTierDisplay';
import AdOverlay from '@/components/AdOverlay';
import { useAdRevenue } from '@/hooks/useAdRevenue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Users, Award, Mail, Star, Gift } from 'lucide-react';

const Index = () => {
  const [showRevenue, setShowRevenue] = useState(false);
  const { totalRevenue, dailyRevenue, adsShown, addRevenue } = useAdRevenue();

  const handleAdComplete = (revenue: number) => {
    addRevenue(revenue);
  };

  return (
    <Layout>
      <AdOverlay onAdComplete={handleAdComplete} />
      
      {/* Revenue Display - Hidden by default, click to show */}
      <div className="fixed bottom-4 left-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRevenue(!showRevenue)}
          className="bg-white"
        >
          💰 Revenue
        </Button>
        {showRevenue && (
          <div className="mt-2 bg-white border rounded-lg shadow-lg p-3 text-sm">
            <div>Total: ₹{totalRevenue.toFixed(2)}</div>
            <div>Today: ₹{dailyRevenue.toFixed(2)}</div>
            <div>Ads: {adsShown}</div>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-realprofit-blue to-realprofit-green text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Real Profit Online Mart
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Quality products, loyalty rewards, and community growth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-realprofit-blue hover:bg-gray-100">
                <Link to="/shop">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Shop Now
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-realprofit-green text-white hover:bg-realprofit-green/90">
                <Link to="/register">
                  <Users className="mr-2 h-5 w-5" />
                  Register Now
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-realprofit-gold text-white hover:bg-realprofit-gold/90">
                <Link to="/login">
                  Login Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Malayalam System Description */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              ഞങ്ങളുടെ സിസ്റ്റം എങ്ങനെ പ്രവർത്തിക്കുന്നു
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8 text-left max-w-3xl mx-auto">
              <div className="space-y-6 text-lg leading-relaxed text-gray-700">
                <p className="text-xl font-semibold text-realprofit-blue mb-4 text-center">
                  റിയൽ പ്രോഫിറ്റ് ഓൺലൈൻ മാർട്ട് - ഒരു പുതിയ അനുഭവം
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <Star className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-realprofit-blue">പോയിന്റ് സിസ്റ്റം</h4>
                      <p className="text-base">വാങ്ങുന്ന ഓരോ ഉൽപ്പാദനത്തിനും പോയിന്റുകൾ ലഭിക്കും.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Award className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-realprofit-blue">ക്ലബ് സിസ്റ്റം</h4>
                      <p className="text-base">ബ്രോൺസ്, സിൽവർ, ഗോൾഡ്, ഡയമണ്ട് - നാല് ക്ലബ്ബുകൾ.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Gift className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-realprofit-blue">പോയിന്റ് റിഡീം</h4>
                      <p className="text-base">സമ്പാദിച്ച പോയിന്റുകൾ ഡിസ്കൗണ്ടായി ഉപയോഗിക്കാം.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <ShoppingCart className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-realprofit-blue">ഗുണനിലവാര ഉൽപ്പാദനങ്ങൾ</h4>
                      <p className="text-base">പുതിയ പച്ചക്കറികളും മികച്ച ഉൽപ്പാദനങ്ങളും.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-realprofit-blue to-realprofit-green text-white p-6 rounded-lg mt-6">
                  <h4 className="font-bold text-lg mb-3 text-center">എങ്ങനെ ആരംഭിക്കാം?</h4>
                  <div className="text-center space-y-2">
                    <p>1. രജിസ്റ്റർ ചെയ്യുക</p>
                    <p>2. ഉൽപ്പാദനങ്ങൾ വാങ്ങുക</p>
                    <p>3. പോയിന്റുകൾ സമ്പാദിക്കുക</p>
                    <p>4. ഡിസ്കൗണ്ട് ലഭിക്കുക</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Real Profit Online Mart?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the best in quality, rewards, and community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <ShoppingCart className="h-12 w-12 mx-auto text-realprofit-blue mb-4" />
                <CardTitle>Premium Quality Products</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Fresh groceries, daily essentials, and quality products sourced from trusted suppliers
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Award className="h-12 w-12 mx-auto text-realprofit-green mb-4" />
                <CardTitle>Loyalty Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Earn points with every purchase and unlock exclusive discounts based on your club
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 mx-auto text-realprofit-gold mb-4" />
                <CardTitle>Community Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join our growing community and benefit from our multi-level reward system
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Club Benefits Section - Updated to use dynamic data */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Membership Clubs
            </h2>
            <p className="text-xl text-gray-600">
              Unlock better discounts as you shop more
            </p>
          </div>
          
          <ClubTierDisplay />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-realprofit-lightBlue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-realprofit-blue mb-4">
            Need Support?
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Our customer support team is here to help you
          </p>
          <div className="flex items-center justify-center">
            <Mail className="h-6 w-6 text-realprofit-blue mr-2" />
            <a 
              href="mailto:werealprofit@gmail.com" 
              className="text-xl text-realprofit-blue hover:underline"
            >
              werealprofit@gmail.com
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
