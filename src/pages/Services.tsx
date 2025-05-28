
import React from 'react';
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone,
  ExternalLink,
  Star,
  CheckCircle
} from 'lucide-react';

const Services = () => {
  const { services } = useData();

  const activeServices = services.filter(service => service.isActive);

  const handleContactForService = () => {
    window.open('mailto:werealprofit@gmail.com?subject=Service Inquiry', '_blank');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Other Services From Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Beyond our supermarket, we offer a variety of additional services to meet your diverse needs. 
            From digital solutions to professional services, we're here to help.
          </p>
        </div>

        {/* Services Grid */}
        {activeServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {activeServices.map((service) => (
              <Card key={service.id} className="h-full hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge 
                    className="absolute top-2 right-2 bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-gray-600 mb-4 flex-1">{service.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Starting from</span>
                      <span className="text-lg font-bold text-green-600">{service.price}</span>
                    </div>
                    
                    <Button 
                      onClick={handleContactForService}
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Get Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Star className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Services Available</h3>
            <p className="text-gray-600 mb-6">
              We're currently updating our services portfolio. Check back soon for exciting new offerings!
            </p>
          </div>
        )}

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Need a Custom Solution?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Don't see what you're looking for? We specialize in creating custom solutions 
                tailored to your specific needs. Get in touch with us to discuss your requirements.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <a href="mailto:werealprofit@gmail.com">
                    <Mail className="w-5 h-5 mr-2" />
                    Email Us
                  </a>
                </Button>
                
                <Button asChild variant="outline" size="lg">
                  <a href="tel:+917306699370">
                    <Phone className="w-5 h-5 mr-2" />
                    Call Us
                  </a>
                </Button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    werealprofit@gmail.com
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    +91 73066 99370
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Services;
