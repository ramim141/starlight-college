import React from 'react';
import ExamControlHub from '../../components/exams/ExamControlHub';

/**
 * TeacherExamsPage - শিক্ষকদের জন্য পরীক্ষার প্রশ্নপত্র আপলোড, 
 * পরীক্ষার সময়সূচি এবং হল পরিদর্শনের রুম বণ্টন পোর্টাল।
 */
const TeacherExamsPage = () => {
  return <ExamControlHub overrideRole="TEACHER" defaultTab="questions" />;
};

export default TeacherExamsPage;
