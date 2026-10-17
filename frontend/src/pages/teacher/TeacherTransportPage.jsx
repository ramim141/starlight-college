import React from 'react';
import TransportFleetHub from '../../components/transport/TransportFleetHub';

/**
 * TeacherTransportPage - শিক্ষক ও স্টাফদের জন্য কলেজ ট্রান্সপোর্ট রুট, 
 * চালকের জরুরি ফোন নম্বর এবং রিয়েল-টাইম ব্রেকডাউন সতর্কতা পোর্টাল।
 */
const TeacherTransportPage = () => {
  return <TransportFleetHub overrideRole="TEACHER" />;
};

export default TeacherTransportPage;
