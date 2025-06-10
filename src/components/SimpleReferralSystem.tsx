
import React from 'react';
import HiddenMLMSystem from './HiddenMLMSystem';

interface SimpleReferralSystemProps {
  customerCode: string;
}

const SimpleReferralSystem: React.FC<SimpleReferralSystemProps> = ({ customerCode }) => {
  return <HiddenMLMSystem customerCode={customerCode} />;
};

export default SimpleReferralSystem;
