
import { useState, useEffect } from 'react';

export const useAdRevenue = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [adsShown, setAdsShown] = useState(0);

  useEffect(() => {
    // Load saved revenue from localStorage
    const saved = localStorage.getItem('adRevenue');
    if (saved) {
      const data = JSON.parse(saved);
      setTotalRevenue(data.total || 0);
      setDailyRevenue(data.daily || 0);
      setAdsShown(data.adsShown || 0);
    }
  }, []);

  const addRevenue = (amount: number) => {
    const newTotal = totalRevenue + amount;
    const newDaily = dailyRevenue + amount;
    const newAdsShown = adsShown + 1;

    setTotalRevenue(newTotal);
    setDailyRevenue(newDaily);
    setAdsShown(newAdsShown);

    // Save to localStorage
    localStorage.setItem('adRevenue', JSON.stringify({
      total: newTotal,
      daily: newDaily,
      adsShown: newAdsShown,
      lastUpdate: new Date().toISOString()
    }));

    console.log(`Ad revenue earned: ₹${amount.toFixed(2)}`);
    console.log(`Total revenue: ₹${newTotal.toFixed(2)}`);
  };

  return {
    totalRevenue,
    dailyRevenue,
    adsShown,
    addRevenue
  };
};
