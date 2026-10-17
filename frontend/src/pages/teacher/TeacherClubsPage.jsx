import React from 'react';
import ClubAlumniHub from '../../components/clubs/ClubAlumniHub';

/**
 * TeacherClubsPage - ক্লাব মডারেটর শিক্ষকদের জন্য ইভেন্ট ম্যানেজমেন্ট 
 * এবং ক্লাব সদস্যদের কার্যক্রম পরিচালনার পোর্টাল।
 */
const TeacherClubsPage = () => {
  return <ClubAlumniHub overrideRole="TEACHER" defaultTab="events" />;
};

export default TeacherClubsPage;
