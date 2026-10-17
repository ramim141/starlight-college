import React from 'react';
import ResultManagementHub from '../../components/results/ResultManagementHub';

/**
 * TeacherResultsPage - শিক্ষক ও ইনচার্জদের জন্য মেধা তালিকা ও বিষয়ভিত্তিক পাশের হার
 */
const TeacherResultsPage = () => {
  return <ResultManagementHub overrideRole="TEACHER" defaultTab="merit" />;
};

export default TeacherResultsPage;
