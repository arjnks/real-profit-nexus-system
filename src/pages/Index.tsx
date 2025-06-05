
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Users, Award, Mail, Star, Gift } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-realprofit-blue to-realprofit-green text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Real Profit Supermarket
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
            <div className="bg-white rounded-lg shadow-lg p-8 text-left max-w-4xl mx-auto">
              <div className="space-y-6 text-lg leading-relaxed text-gray-700">
                <p className="text-xl font-semibold text-realprofit-blue mb-4">
                  റിയൽ പ്രോഫിറ്റ് സൂപ്പർമാർക്കറ്റ് - ഒരു പുതിയ അനുഭവം
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Star className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-realprofit-blue">പോയിന്റ് സിസ്റ്റം</h4>
                        <p>വാങ്ങുന്ന ഓരോ ഉൽപ്പാദനത്തിനും പോയിന്റുകൾ ലഭിക്കും. MRP-യും വിൽപ്പന വിലയും തമ്മിലുള്ള വ്യത്യാസം പോയിന്റായി നിങ്ങളുടെ അക്കൗണ്ടിൽ ചേർക്കപ്പെടും.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Award className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-realprofit-blue">ടയർ സിസ്റ്റം</h4>
                        <p>ബ്രോൺസ്, സിൽവർ, ഗോൾഡ്, ഡയമണ്ട് - നാല് ടയറുകൾ. കൂടുതൽ വാങ്ങുന്തോറും മികച്ച ആനുകൂല്യങ്ങൾ ലഭിക്കും.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Users className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-realprofit-blue">MLM സിസ്റ്റം</h4>
                        <p>നിങ്ങളുടെ റഫറൽ കോഡ് ഉപയോഗിച്ച് മറ്റുള്ളവർ രജിസ്റ്റർ ചെയ്യുമ്പോൾ അവരുടെ വാങ്ങലിൽ നിന്ന് നിങ്ങൾക്കും പ്രതിഫലം ലഭിക്കും.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Gift className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-realprofit-blue">പോയിന്റ് റിഡീം</h4>
                        <p>സമ്പാദിച്ച പോയിന്റുകൾ നിങ്ങളുടെ ടയർ അനുസരിച്ച് ഡിസ്കൗണ്ടായി ഉപയോഗിക്കാം.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-realprofit-blue to-realprofit-green text-white p-6 rounded-lg mt-6">
                  <h4 className="font-bold text-xl mb-3">എങ്ങനെ ആരംഭിക്കാം?</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>ഒരു റഫറൽ കോഡ് ഉപയോഗിച്ച് രജിസ്റ്റർ ചെയ്യുക (അല്ലെങ്കിൽ ഇല്ലാതെയും രജിസ്റ്റർ ചെയ്യാം)</li>
                    <li>ഞങ്ങളുടെ സ്റ്റോറിൽ നിന്ന് ഉൽപ്പാദനങ്ങൾ വാങ്ങുക</li>
                    <li>ഓരോ വാങ്ങലിലും പോയിന്റുകൾ സമ്പാദിക്കുക</li>
                    <li>നിങ്ങളുടെ റഫറൽ കോഡ് പങ്കിട്ട് കൂടുതൽ പ്രതിഫലം നേടുക</li>
                    <li>പോയിന്റുകൾ ഉപയോഗിച്ച് ഡിസ്കൗണ്ട് ലഭിക്കുക</li>
                  </ol>
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
              Why Choose Real Profit?
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
                  Earn points with every purchase and unlock exclusive discounts based on your tier
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

      {/* Tier Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Membership Tiers
            </h2>
            <p className="text-xl text-gray-600">
              Unlock better discounts as you shop more
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-2 border-amber-700">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-amber-700 rounded-full mx-auto mb-2"></div>
                <CardTitle className="text-amber-700">Bronze</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold mb-2">10%</p>
                <p className="text-sm text-gray-600">Points discount privilege</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-400">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-2"></div>
                <CardTitle className="text-gray-600">Silver</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold mb-2">20%</p>
                <p className="text-sm text-gray-600">Points discount privilege</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-yellow-500">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                <CardTitle className="text-yellow-600">Gold</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold mb-2">30%</p>
                <p className="text-sm text-gray-600">Points discount privilege</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-500">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2"></div>
                <CardTitle className="text-blue-600">Diamond</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold mb-2">70%</p>
                <p className="text-sm text-gray-600">Points discount privilege</p>
              </CardContent>
            </Card>
          </div>
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
