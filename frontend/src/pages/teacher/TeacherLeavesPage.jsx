import React from 'react';
import LeaveManagementHub from '../../components/leaves/LeaveManagementHub';

/**
 * TeacherLeavesPage - শিক্ষকদের জন্য নিজস্ব ছুটির আবেদন, প্রক্সি ক্লাস শিডিউল 
 * এবং শ্রেণি ইনচার্জদের জন্য নিজ শাখার শিক্ষার্থীদের ছুটির সুপারিশ পোর্টাল।
 */
const TeacherLeavesPage = () => {
  return <LeaveManagementHub overrideRole="TEACHER" />;
};

export default TeacherLeavesPage;
