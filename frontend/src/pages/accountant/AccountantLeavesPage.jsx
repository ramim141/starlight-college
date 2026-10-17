import React from 'react';
import LeaveManagementHub from '../../components/leaves/LeaveManagementHub';

/**
 * AccountantLeavesPage - অ্যাকাউন্ট্যান্ট ও স্টাফদের ছুটির আবেদন ও স্ট্যাটাস ট্র্যাকিং
 */
const AccountantLeavesPage = () => {
  return <LeaveManagementHub overrideRole="STAFF" defaultTab="teacher" />;
};

export default AccountantLeavesPage;
