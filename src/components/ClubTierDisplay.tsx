import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  const [expandedTiers, setExpandedTiers] = useState<{
    bronze: boolean;
    silver: boolean;
    gold: boolean;
    diamond: boolean;
  }>({
    bronze: false,
    silver: false,
    gold: false,
    diamond: false
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

  const toggleExpanded = (tier: keyof typeof expandedTiers) => {
    setExpandedTiers(prev => ({
      ...prev,
      [tier]: !prev[tier]
    }));
  };

  const getDisplayedItems = (tierData: ClubTierData[], tierKey: keyof typeof expandedTiers) => {
    if (tierData.length <= 5 || expandedTiers[tierKey]) {
      return tierData;
    }
    return tierData.slice(0, 5);
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
        const displayedItems = getDisplayedItems(tierData, tier as keyof typeof expandedTiers);
        const hasMoreItems = tierData.length > 5;
        const isExpanded = expandedTiers[tier as keyof typeof expandedTiers];
        
        return (
          <Card key={tier} className={`border-2 border-${color}`}>
            <CardHeader className="text-center">
              <div className={`w-12 h-12 bg-${color} rounded-full mx-auto mb-2`}></div>
              <CardTitle className={`text-${color}`}>{tierName}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">Points discount privilege</p>
              
              {/* Display dynamic content from club management */}
              {tierData.length > 0 && (
                <div className="space-y-3">
                  {displayedItems.map((item) => (
                    <div key={item.id} className="text-left">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="w-full h-auto object-contain rounded mb-2"
                        />
                      )}
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-600 mb-1">{item.description}</p>
                      <p className="text-sm font-bold text-green-600">{item.price}</p>
                    </div>
                  ))}
                  
                  {hasMoreItems && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpanded(tier as keyof typeof expandedTiers)}
                      className="w-full mt-3"
                    >
                      {isExpanded ? 'Show Less' : `Show More (${tierData.length - 5} more)`}
                    </Button>
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
