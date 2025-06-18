
import React from 'react';
import Layout from '@/components/Layout';
import Leaderboard from '@/components/Leaderboard';

const LeaderboardPage = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Leaderboard</h1>
          <p className="text-gray-600">See how you rank against other customers based on points earned</p>
        </div>
        
        <Leaderboard isAdmin={false} showOffer={true} />
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
