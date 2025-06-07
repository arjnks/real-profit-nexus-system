
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface ClubTierData {
  id: string;
  tier_name: string;
  title: string;
  description: string;
  price: string;
  image_url: string;
}

const ClubTierDisplay = () => {
  const [clubTiers, setClubTiers] = useState<{
    bronze: ClubTierData[];
    silver: ClubTierData[];
    gold: ClubTierData[];
    diamond: ClubTierData[];
  }>({
    bronze: [],
    silver: [],
    gold: [],
    diamond: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClubTierData();
  }, []);

  const loadClubTierData = async () => {
    try {
      const { data, error } = await supabase
        .from('club_tiers')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error loading club tier data:', error);
        return;
      }

      // Group data by tier
      const groupedData = {
        bronze: [] as ClubTierData[],
        silver: [] as ClubTierData[],
        gold: [] as ClubTierData[],
        diamond: [] as ClubTierData[]
      };

      data?.forEach(item => {
        const tierName = item.tier_name.toLowerCase() as keyof typeof groupedData;
        if (groupedData[tierName]) {
          groupedData[tierName].push(item);
        }
      });

      setClubTiers(groupedData);
    } catch (error) {
      console.error('Error loading club tier data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'amber-700';
      case 'silver': return 'gray-400';
      case 'gold': return 'yellow-500';
      case 'diamond': return 'blue-500';
      default: return 'gray-400';
    }
  };

  const getTierDiscountPercentage = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return '10%';
      case 'silver': return '20%';
      case 'gold': return '30%';
      case 'diamond': return '70%';
      default: return '0%';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['Bronze', 'Silver', 'Gold', 'Diamond'].map((tier) => (
          <Card key={tier} className={`border-2 border-${getTierColor(tier)}`}>
            <CardHeader className="text-center">
              <div className={`w-12 h-12 bg-${getTierColor(tier)} rounded-full mx-auto mb-2`}></div>
              <CardTitle className={`text-${getTierColor(tier)}`}>{tier}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-2xl font-bold mb-2">{getTierDiscountPercentage(tier)}</p>
              <p className="text-sm text-gray-600">Points discount privilege</p>
              <div className="mt-4 text-sm text-gray-500">
                Loading content...
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {['bronze', 'silver', 'gold', 'diamond'].map((tier) => {
        const tierData = clubTiers[tier as keyof typeof clubTiers];
        const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
        const color = getTierColor(tier);
        
        return (
          <Card key={tier} className={`border-2 border-${color}`}>
            <CardHeader className="text-center">
              <div className={`w-12 h-12 bg-${color} rounded-full mx-auto mb-2`}></div>
              <CardTitle className={`text-${color}`}>{tierName}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-2xl font-bold mb-2">{getTierDiscountPercentage(tier)}</p>
              <p className="text-sm text-gray-600">Points discount privilege</p>
              
              {/* Display dynamic content from club management */}
              {tierData.length > 0 && (
                <div className="mt-4 space-y-3">
                  {tierData.slice(0, 2).map((item, index) => (
                    <div key={item.id} className="text-left">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="w-full h-20 object-cover rounded mb-2"
                        />
                      )}
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-600 mb-1">{item.description}</p>
                      <p className="text-sm font-bold text-green-600">{item.price}</p>
                    </div>
                  ))}
                  {tierData.length > 2 && (
                    <p className="text-xs text-gray-500">+{tierData.length - 2} more offers</p>
                  )}
                </div>
              )}
              
              {tierData.length === 0 && (
                <div className="mt-4 text-sm text-gray-500">
                  No special offers available
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ClubTierDisplay;
