
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ClubTierCard from '@/components/ClubTierCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClubImage {
  id: string;
  image: string;
  title: string;
  description: string;
  price: string;
}

const ClubManagement = () => {
  const { toast } = useToast();
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

  // Load club tier data from database on component mount
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
        toast({
          title: "Error",
          description: "Failed to load club tier data",
          variant: "destructive"
        });
        return;
      }

      // Group data by tier
      const groupedData = {
        bronze: [] as ClubImage[],
        silver: [] as ClubImage[],
        gold: [] as ClubImage[],
        diamond: [] as ClubImage[]
      };

      data?.forEach(item => {
        const clubImage: ClubImage = {
          id: item.id,
          image: item.image_url,
          title: item.title,
          description: item.description,
          price: item.price
        };

        const tierName = item.tier_name.toLowerCase() as keyof typeof groupedData;
        if (groupedData[tierName]) {
          groupedData[tierName].push(clubImage);
        }
      });

      setClubTiers(groupedData);
    } catch (error) {
      console.error('Error loading club tier data:', error);
      toast({
        title: "Error",
        description: "Failed to load club tier data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClubTierUpdate = async (tier: string, images: ClubImage[]) => {
    try {
      console.log(`Saving ${tier} tier with ${images.length} images`);

      // First, delete existing data for this tier
      const { error: deleteError } = await supabase
        .from('club_tiers')
        .delete()
        .eq('tier_name', tier);

      if (deleteError) {
        console.error('Error deleting old data:', deleteError);
        throw deleteError;
      }

      // Insert new data
      if (images.length > 0) {
        const insertData = images.map((img, index) => ({
          tier_name: tier,
          title: img.title,
          description: img.description,
          price: img.price,
          image_url: img.image,
          display_order: index
        }));

        const { error: insertError } = await supabase
          .from('club_tiers')
          .insert(insertData);

        if (insertError) {
          console.error('Error inserting new data:', insertError);
          throw insertError;
        }
      }

      // Update local state
      setClubTiers(prev => ({
        ...prev,
        [tier]: images
      }));

      toast({
        title: "Success",
        description: `${tier} tier updated successfully`,
      });

      console.log(`Successfully saved ${tier} tier`);
    } catch (error) {
      console.error('Error saving club tier data:', error);
      toast({
        title: "Error",
        description: "Failed to save club tier data",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading club tier data...</div>
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
