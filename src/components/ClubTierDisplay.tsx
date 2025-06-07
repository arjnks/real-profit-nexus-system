
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabaseService } from '@/services/supabaseService';

interface ClubTier {
  id: string;
  tierName: string;
  imageUrl: string;
  title: string;
  description: string;
  price: string;
  displayOrder: number;
}

const ClubTierDisplay = () => {
  const [clubTiers, setClubTiers] = useState<ClubTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClubTiers();
  }, []);

  const loadClubTiers = async () => {
    try {
      const tiers = await supabaseService.getClubTiers();
      setClubTiers(tiers);
    } catch (error) {
      console.error('Error loading club tiers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'bronze': return 'amber-700';
      case 'silver': return 'gray-400';
      case 'gold': return 'yellow-500';
      case 'diamond': return 'blue-500';
      default: return 'gray-500';
    }
  };

  const groupedTiers = clubTiers.reduce((acc, tier) => {
    if (!acc[tier.tierName]) {
      acc[tier.tierName] = [];
    }
    acc[tier.tierName].push(tier);
    return acc;
  }, {} as Record<string, ClubTier[]>);

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="text-center">Loading club benefits...</div>
      </div>
    );
  }

  if (clubTiers.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Club Membership Benefits</h2>
          <p className="text-lg text-gray-600">
            Join our exclusive club and enjoy amazing benefits at every tier
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(groupedTiers).map(([tierName, tiers]) => {
            const color = getTierColor(tierName);
            return (
              <Card key={tierName} className={`border-2 border-${color}`}>
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 bg-${color} rounded-full mx-auto mb-2`}></div>
                  <CardTitle className={`text-${color.replace('gray-400', 'gray-600')} capitalize`}>
                    {tierName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tiers.map((tier) => (
                    <div key={tier.id} className="border rounded-lg p-3">
                      {tier.imageUrl && (
                        <div className="mb-3">
                          <img
                            src={tier.imageUrl}
                            alt={tier.title}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                      {tier.title && (
                        <h4 className="font-semibold text-sm mb-1">{tier.title}</h4>
                      )}
                      {tier.description && (
                        <p className="text-sm text-gray-600 mb-2">{tier.description}</p>
                      )}
                      {tier.price && (
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{tier.price}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ClubTierDisplay;
