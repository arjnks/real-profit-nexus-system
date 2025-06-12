
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

const AdSenseSetup = () => {
  const steps = [
    {
      title: "Apply for Google AdSense",
      description: "Create an AdSense account and submit your website for review",
      status: "pending",
      link: "https://www.google.com/adsense/",
      details: "Usually takes 1-3 days for approval"
    },
    {
      title: "Add AdSense Code to HTML",
      description: "Add the AdSense script to your website's head section",
      status: "pending",
      code: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossorigin="anonymous"></script>`
    },
    {
      title: "Create Ad Units",
      description: "Set up different ad formats in your AdSense dashboard",
      status: "pending",
      details: "Interstitial, banner, and display ads"
    },
    {
      title: "Replace Demo Ads",
      description: "Update the ad containers with your real AdSense code",
      status: "pending",
      details: "Replace placeholder divs with AdSense ad units"
    }
  ];

  const paymentInfo = [
    { label: "Minimum Payout", value: "₹1,000" },
    { label: "Payment Date", value: "21st of each month" },
    { label: "Payment Methods", value: "Bank Transfer, UPI" },
    { label: "Expected Revenue", value: "₹0.10-₹2 per ad view" }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Google AdSense Integration Setup
          </CardTitle>
          <CardDescription>
            Follow these steps to start earning real money from your website ads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-gray-600 mb-2">{step.description}</p>
                  {step.details && (
                    <p className="text-sm text-gray-500 mb-2">{step.details}</p>
                  )}
                  {step.code && (
                    <div className="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
                      {step.code}
                    </div>
                  )}
                  {step.link && (
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <a href={step.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open AdSense
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>
            Here's what you can expect from Google AdSense payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {paymentInfo.map((info, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">{info.label}</div>
                <div className="font-semibold">{info.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h4 className="font-semibold text-green-800">Bank Account Setup</h4>
            <p className="text-sm text-green-700 mt-1">
              Add your Indian bank account details in AdSense for direct transfers. 
              Supports all major Indian banks including SBI, ICICI, HDFC, Axis, etc.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdSenseSetup;
