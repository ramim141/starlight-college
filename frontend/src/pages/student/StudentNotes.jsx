import React from 'react';
import StudentPlaceholder from '../../components/student/common/StudentPlaceholder';
import { FileEdit } from 'lucide-react';

const StudentNotes = () => {
  return (
    <StudentPlaceholder
      title="ব্যক্তিগত নোটস ও ড্রাফট"
      group="পড়াশোনা"
      icon={FileEdit}
      description="আপনার ক্লাসের নোটস, পড়ার রিমাইন্ডার এবং দরকারি টিপস নিরাপদে সংরক্ষণ করুন।"
    />
  );
};

export default StudentNotes;
