import React from 'react';
import AcademicControlHub from '../../components/academics/AcademicControlHub';

/**
 * TeacherRoutinePage - শিক্ষকদের জন্য ক্লাস রুটিন, সিলেবাস ও ছুটির ক্যালেন্ডার
 */
const TeacherRoutinePage = () => {
  return <AcademicControlHub overrideRole="TEACHER" defaultTab="routines" />;
};

export default TeacherRoutinePage;
