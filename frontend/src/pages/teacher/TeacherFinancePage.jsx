import React from 'react';
import FinancialHub from '../../components/finance/FinancialHub';

/**
 * TeacherFinancePage - শিক্ষকদের জন্য মাসিক বেতনের স্লিপ, 
 * বিশেষ ভাতা ও স্যালারি ক্লেইম আবেদন পোর্টাল।
 */
const TeacherFinancePage = () => {
  return <FinancialHub overrideRole="TEACHER" defaultTab="my_payroll" />;
};

export default TeacherFinancePage;
