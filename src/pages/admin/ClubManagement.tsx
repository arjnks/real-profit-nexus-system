
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ClubTierCard from '@/components/ClubTierCard';

const ClubManagement = () => {
  // State for club tier data - in a real app, this would come from a database
  const [clubTiers, setClubTiers] = useState({
    bronze: { image: '', price: '' },
    silver: { image: '', price: '' },
    gold: { image: '', price: '' },
    diamond: { image: '', price: '' }
  });

  const handleClubTierUpdate = (tier: string, image: string, price: string) => {
    setClubTiers(prev => ({
      ...prev,
      [tier]: { image, price }
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
            image={clubTiers.bronze.image}
            price={clubTiers.bronze.price}
            color="amber-700"
            onUpdate={(image, price) => handleClubTierUpdate('bronze', image, price)}
            isAdmin={true}
          />
          
          <ClubTierCard
            title="Silver"
            image={clubTiers.silver.image}
            price={clubTiers.silver.price}
            color="gray-400"
            onUpdate={(image, price) => handleClubTierUpdate('silver', image, price)}
            isAdmin={true}
          />
          
          <ClubTierCard
            title="Gold"
            image={clubTiers.gold.image}
            price={clubTiers.gold.price}
            color="yellow-500"
            onUpdate={(image, price) => handleClubTierUpdate('gold', image, price)}
            isAdmin={true}
          />
          
          <ClubTierCard
            title="Diamond"
            image={clubTiers.diamond.image}
            price={clubTiers.diamond.price}
            color="blue-500"
            onUpdate={(image, price) => handleClubTierUpdate('diamond', image, price)}
            isAdmin={true}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">How it works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload attractive images for each club tier to showcase benefits</li>
            <li>• Set special selling prices to highlight value propositions</li>
            <li>• These will be displayed on the homepage to attract new customers</li>
            <li>• Changes are saved automatically when you click Save</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClubManagement;
