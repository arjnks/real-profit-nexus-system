
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AdOverlayProps {
  onAdComplete: (revenue: number) => void;
}

const AdOverlay: React.FC<AdOverlayProps> = ({ onAdComplete }) => {
  const [showAd, setShowAd] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

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
    // Estimated AdSense revenue per interstitial ad view in India
    const estimatedRevenue = 0.15; // ₹0.15 average per view
    onAdComplete(estimatedRevenue);
  };

  if (!showAd) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-95">
      <div className="relative w-full h-full bg-white flex flex-col items-center justify-center">
        {canClose && (
          <button
            onClick={handleCloseAd}
            className="absolute top-6 right-6 bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition-all z-10"
          >
            <X className="h-6 w-6" />
          </button>
        )}
        
        <div className="text-center max-w-4xl px-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Advertisement
          </h2>
          
          {!canClose && (
            <div className="text-lg text-gray-600 mb-6">
              <div className="inline-block bg-gray-100 rounded-full px-6 py-3">
                Ad closes in {countdown} seconds...
              </div>
            </div>
          )}
          
          {canClose && (
            <div className="text-base text-gray-500 mb-6">
              Click X to close and continue
            </div>
          )}
        </div>

        {/* Google AdSense Interstitial Ad Container */}
        <div 
          id="adsense-interstitial-container" 
          className="w-full max-w-4xl h-96 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center"
        >
          <div className="text-center text-gray-500">
            <div className="text-lg font-semibold mb-2">Google AdSense Ad</div>
            <div className="text-sm">
              Replace this div with your AdSense ad unit code
            </div>
            <div className="text-xs mt-2 opacity-75">
              Ad Unit ID: ca-pub-XXXXXXXXXX/XXXXXXXXXX
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-400 text-center max-w-md">
          <p>This ad helps support our website. Revenue goes directly to site maintenance and improvements.</p>
        </div>
      </div>
    </div>
  );
};

export default AdOverlay;
