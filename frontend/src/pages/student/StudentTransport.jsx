import React from 'react';
import StudentPlaceholder from '../../components/student/common/StudentPlaceholder';
import { Bus } from 'lucide-react';

const StudentTransport = () => {
  return (
    <StudentPlaceholder
      title="আমার পরিবহন ও বাস রুট"
      group="সেবা"
      icon={Bus}
      description="আপনার নির্ধারিত কলেজ বাস নম্বর, ড্রাইভারের তথ্য, পিকআপ রুট ও ইমার্জেন্সি অ্যালার্ট দেখুন।"
    />
  );
};

export default StudentTransport;
