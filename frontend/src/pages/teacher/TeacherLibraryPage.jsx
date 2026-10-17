import React from 'react';
import LibraryHub from '../../components/library/LibraryHub';

/**
 * TeacherLibraryPage - শিক্ষকদের জন্য লাইব্রেরির বই অনুসন্ধান, 
 * ধার নেওয়ার আবেদন এবং ব্যক্তিগত বই ইস্যুর রেকর্ড পোর্টাল।
 */
const TeacherLibraryPage = () => {
  return <LibraryHub overrideRole="TEACHER" />;
};

export default TeacherLibraryPage;
