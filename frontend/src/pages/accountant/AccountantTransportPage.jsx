import React from 'react';
import TransportFleetHub from '../../components/transport/TransportFleetHub';

/**
 * AccountantTransportPage - ট্রান্সপোর্ট ফি আদায়, মাসিক পরিবহন বিল
 * এবং জ্বালানি ও রক্ষণাবেক্ষণ খরচ ম্যানেজমেন্ট পোর্টাল।
 */
const AccountantTransportPage = () => {
  return <TransportFleetHub overrideRole="ACCOUNTANT" defaultTab="bills" />;
};

export default AccountantTransportPage;
