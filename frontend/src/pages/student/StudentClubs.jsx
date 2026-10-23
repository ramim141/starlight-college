import React from 'react';
import StudentPlaceholder from '../../components/student/common/StudentPlaceholder';
import { Sparkles } from 'lucide-react';

const StudentClubs = () => {
  return (
    <StudentPlaceholder
      title="কলেজ ক্লাব ও কো-কারিকুলার"
      group="সেবা"
      icon={Sparkles}
      description="ডিবেট, সায়েন্স, কালচারাল বা স্পোর্টস ক্লাবে যুক্ত হন এবং আসন্ন ইভেন্টে অংশ নিন।"
    />
  );
};

export default StudentClubs;
