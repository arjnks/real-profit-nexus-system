
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ClubTierCard from '@/components/ClubTierCard';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

interface ClubImage {
  id: string;
  image: string;
  title: string;
  description: string;
  price: string;
}

const ClubManagement = () => {
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClubTiers();
  }, []);

  const loadClubTiers = async () => {
    try {
      setIsLoading(true);
      const allTiers = await supabaseService.getClubTiers();
      
      const tierData = {
        bronze: [],
        silver: [],
        gold: [],
        diamond: []
      };

      allTiers.forEach(tier => {
        const tierKey = tier.tierName as keyof typeof tierData;
        if (tierKey in tierData) {
          tierData[tierKey].push({
            id: tier.id,
            image: tier.imageUrl,
            title: tier.title,
            description: tier.description,
            price: tier.price,
          });
        }
      });

      setClubTiers(tierData);
    } catch (error) {
      console.error('Error loading club tiers:', error);
      toast.error('Failed to load club tiers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClubTierUpdate = async (tier: string, images: ClubImage[]) => {
    try {
      const tiersToSave = images.map(img => ({
        imageUrl: img.image,
        title: img.title,
        description: img.description,
        price: img.price,
        displayOrder: 0,
      }));

      const success = await supabaseService.saveClubTiers(tier, tiersToSave);
      
      if (success) {
        setClubTiers(prev => ({
          ...prev,
          [tier]: images
        }));
        toast.success(`${tier.charAt(0).toUpperCase() + tier.slice(1)} tier updated successfully!`);
      } else {
        toast.error('Failed to save club tier data');
      }
    } catch (error) {
      console.error('Error updating club tier:', error);
      toast.error('Failed to update club tier');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading club tiers...</div>
        </div>
      </AdminLayout>
    );
  }

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
            <li>• Changes are saved automatically to the database when you click Save</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClubManagement;
