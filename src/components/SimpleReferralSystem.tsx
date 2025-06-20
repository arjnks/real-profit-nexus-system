
import React from 'react';

interface SimpleReferralSystemProps {
  customerCode: string;
}

const SimpleReferralSystem: React.FC<SimpleReferralSystemProps> = ({ customerCode }) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-2">Referral Code</h3>
      <p className="text-sm text-gray-600 mb-2">Share your referral code with friends:</p>
      <div className="flex items-center gap-2">
        <code className="bg-white px-2 py-1 rounded border">{customerCode}</code>
        <button 
          onClick={() => navigator.clipboard.writeText(customerCode)}
          className="text-blue-600 text-sm hover:underline"
        >
          Copy
        </button>
      </div>
    </div>
  );
};

export default SimpleReferralSystem;
