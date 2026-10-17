import React from 'react';
import InventoryMarkerHub from '../../components/inventory/InventoryMarkerHub';

/**
 * AccountantInventoryPage - কলেজের স্থায়ী সম্পদ স্টক, 
 * মার্কার সেন্ট্রাল স্টক ক্রয় ও হিসাবরক্ষণ পোর্টাল।
 */
const AccountantInventoryPage = () => {
  return <InventoryMarkerHub overrideRole="STAFF" defaultTab="assets" />;
};

export default AccountantInventoryPage;
