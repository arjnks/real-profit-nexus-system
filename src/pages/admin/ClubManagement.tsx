
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ClubTierCard from '@/components/ClubTierCard';

interface ClubImage {
  id: string;
  image: string;
  title: string;
  description: string;
  price: string;
}

const ClubManagement = () => {
  // State for club tier data - in a real app, this would come from a database
  const [clubTiers, setClubTiers] = useState<{
    bronze: ClubImage[];
    silver: ClubImage[];
    gold: ClubImage[];
    diamond: ClubImage[];
  }>({
    bronze: [],
    silver: [],
    gold: [],
    diamond: []
  });

  const handleClubTierUpdate = (tier: string, images: ClubImage[]) => {
    setClubTiers(prev => ({
      ...prev,
      [tier]: images
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Club Management</h1>
          <p className="text-muted-foreground">
            Manage club tier images and special prices to attract customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ClubTierCard
            title="Bronze"
            images={clubTiers.bronze}
            color="amber-700"
            onUpdate={(images) => handleClubTierUpdate('bronze', images)}
            isAdmin={true}
          />
          
          <ClubTierCard
            title="Silver"
            images={clubTiers.silver}
            color="gray-400"
            onUpdate={(images) => handleClubTierUpdate('silver', images)}
            isAdmin={true}
          />
          
          <ClubTierCard
            title="Gold"
            images={clubTiers.gold}
            color="yellow-500"
            onUpdate={(images) => handleClubTierUpdate('gold', images)}
            isAdmin={true}
          />
          
          <ClubTierCard
            title="Diamond"
            images={clubTiers.diamond}
            color="blue-500"
            onUpdate={(images) => handleClubTierUpdate('diamond', images)}
            isAdmin={true}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">How it works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload multiple attractive images for each club tier to showcase benefits</li>
            <li>• Add individual titles, descriptions, and prices for each image</li>
            <li>• These will be displayed on the homepage to attract new customers</li>
            <li>• Changes are saved automatically when you click Save</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClubManagement;
