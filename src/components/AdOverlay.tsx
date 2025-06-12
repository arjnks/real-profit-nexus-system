
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AdOverlayProps {
  onAdComplete: (revenue: number) => void;
}

const AdOverlay: React.FC<AdOverlayProps> = ({ onAdComplete }) => {
  const [showAd, setShowAd] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  // Sample ads - replace with real ad content
  const ads = [
    {
      title: "Premium Shopping Experience",
      content: "Get 50% off on all premium products! Limited time offer.",
      revenue: 0.25,
      bg: "bg-gradient-to-br from-blue-600 to-purple-700"
    },
    {
      title: "Local Business Spotlight", 
      content: "Support local businesses in your area. Find the best deals nearby!",
      revenue: 0.30,
      bg: "bg-gradient-to-br from-green-600 to-teal-700"
    },
    {
      title: "Health & Wellness",
      content: "Transform your health with our certified wellness programs.",
      revenue: 0.35,
      bg: "bg-gradient-to-br from-orange-600 to-red-700"
    }
  ];

  const currentAd = ads[Math.floor(Math.random() * ads.length)];

  useEffect(() => {
    // Show ad after 2 seconds of page load
    const showTimer = setTimeout(() => {
      setShowAd(true);
    }, 2000);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (showAd && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanClose(true);
    }
  }, [showAd, countdown]);

  const handleCloseAd = () => {
    setShowAd(false);
    onAdComplete(currentAd.revenue);
  };

  if (!showAd) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-95">
      <div className={`relative w-full h-full ${currentAd.bg} flex items-center justify-center text-white`}>
        {canClose && (
          <button
            onClick={handleCloseAd}
            className="absolute top-6 right-6 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        )}
        
        <div className="text-center max-w-4xl px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-pulse">
            {currentAd.title}
          </h1>
          <p className="text-2xl md:text-3xl mb-8 opacity-90">
            {currentAd.content}
          </p>
          
          {!canClose && (
            <div className="text-xl">
              <div className="inline-block bg-white bg-opacity-20 rounded-full px-6 py-3">
                Ad closes in {countdown} seconds...
              </div>
            </div>
          )}
          
          {canClose && (
            <div className="text-lg opacity-75">
              Click X to close
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdOverlay;
