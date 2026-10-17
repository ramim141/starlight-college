import React from 'react';
import FinancialHub from '../../components/finance/FinancialHub';

/**
 * AccountantFinancePage - হিসাবরক্ষণ কর্মকর্তাদের জন্য খরচের ভাউচার দাখিল,
 * ব্যাংক জমা রেকর্ড, বাল্ক পে-রোল হিসাব এবং বকেয়া তালিকা অডিট পোর্টাল।
 */
const AccountantFinancePage = () => {
  return <FinancialHub overrideRole="ACCOUNTANT" defaultTab="expenses" />;
};

export default AccountantFinancePage;
