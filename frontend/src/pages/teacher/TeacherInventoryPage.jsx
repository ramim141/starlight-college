import React from 'react';
import InventoryMarkerHub from '../../components/inventory/InventoryMarkerHub';

/**
 * TeacherInventoryPage - শিক্ষকদের জন্য ক্লাসরুম মার্কার রিকুইজিশন, 
 * মার্কার প্রাপ্তির রিসিভ একনলেজমেন্ট ও প্রাতিষ্ঠানিক সম্পদের তালিকা।
 */
const TeacherInventoryPage = () => {
  return <InventoryMarkerHub overrideRole="TEACHER" />;
};

export default TeacherInventoryPage;
