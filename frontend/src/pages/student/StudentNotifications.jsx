import React from 'react';
import StudentPlaceholder from '../../components/student/common/StudentPlaceholder';
import { BellRing } from 'lucide-react';

const StudentNotifications = () => {
  return (
    <StudentPlaceholder
      title="নোটিফিকেশন সেন্টার"
      group="আমার তথ্য"
      icon={BellRing}
      description="কলেজ প্রশাসন ও শিক্ষকদের পাঠানো সকল বার্তা, এসএমএস ও সতর্কবার্তা একসাথে দেখুন।"
    />
  );
};

export default StudentNotifications;
