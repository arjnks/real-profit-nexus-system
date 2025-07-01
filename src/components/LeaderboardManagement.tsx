
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getLeaderboardConfig } from '@/services/supabaseService';
import type { LeaderboardConfig } from '@/types';
import Leaderboard from './Leaderboard';

const LeaderboardManagement = () => {
  const [config, setConfig] = useState<LeaderboardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const configData = await supabaseService.getLeaderboardConfig();
      setConfig(configData);
    } catch (error) {
      console.error('Error fetching leaderboard config:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leaderboard configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const success = await supabaseService.updateLeaderboardConfig({
        top_count: config.top_count,
        offer_title: config.offer_title,
        offer_description: config.offer_description,
        offer_discount_percentage: config.offer_discount_percentage,
        is_active: config.is_active
      });

      if (success) {
        toast({
          title: "Success",
          description: "Leaderboard configuration updated successfully",
        });
      } else {
        throw new Error('Failed to update configuration');
      }
    } catch (error) {
      console.error('Error updating leaderboard config:', error);
      toast({
        title: "Error",
        description: "Failed to update leaderboard configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (field: keyof LeaderboardConfig, value: any) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">Loading configuration...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Leaderboard Management</h2>
        <p className="text-muted-foreground">Configure customer leaderboard and top performer offers</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard Configuration</CardTitle>
            <CardDescription>
              Set up the leaderboard display and top performer rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is-active">Enable Leaderboard</Label>
              <Switch
                id="is-active"
                checked={config?.is_active || false}
                onCheckedChange={(checked) => updateConfig('is_active', checked)}
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="top-count">Top Performers Count</Label>
              <Input
                id="top-count"
                type="number"
                min="1"
                max="50"
                value={config?.top_count || 10}
                onChange={(e) => updateConfig('top_count', parseInt(e.target.value))}
                placeholder="Number of top performers to reward"
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="offer-title">Offer Title</Label>
              <Input
                id="offer-title"
                value={config?.offer_title || ''}
                onChange={(e) => updateConfig('offer_title', e.target.value)}
                placeholder="e.g., Top Performer Reward"
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="offer-description">Offer Description</Label>
              <Textarea
                id="offer-description"
                value={config?.offer_description || ''}
                onChange={(e) => updateConfig('offer_description', e.target.value)}
                placeholder="Describe the offer for top performers"
                rows={3}
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="discount-percentage">Discount Percentage</Label>
              <Input
                id="discount-percentage"
                type="number"
                min="1"
                max="100"
                value={config?.offer_discount_percentage || 10}
                onChange={(e) => updateConfig('offer_discount_percentage', parseInt(e.target.value))}
                placeholder="Discount percentage for top performers"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Preview how the leaderboard will appear to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Leaderboard isAdmin={false} showOffer={true} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Leaderboard isAdmin={true} showOffer={false} />
    </div>
  );
};

export default LeaderboardManagement;
