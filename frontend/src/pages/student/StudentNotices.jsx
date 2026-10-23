import React from 'react';
import StudentPlaceholder from '../../components/student/common/StudentPlaceholder';
import { Bell } from 'lucide-react';

const StudentNotices = () => {
  return (
    <StudentPlaceholder
      title="কলেজ নোটিশ বোর্ড"
      group="আমার তথ্য"
      icon={Bell}
      description="কলেজের প্রশাসনিক, অ্যাকাডেমিক ও পরীক্ষার জরুরি বিজ্ঞপ্তি ও সার্কুলার দেখুন।"
    />
  );
};

export default StudentNotices;
