import React from 'react';
import StudentPlaceholder from '../../components/student/common/StudentPlaceholder';
import { CalendarCheck } from 'lucide-react';

const StudentAttendance = () => {
  return (
    <StudentPlaceholder
      title="আমার উপস্থিতি ও অ্যাটেনডেন্স"
      group="পড়াশোনা"
      icon={CalendarCheck}
      description="আপনার দৈনিক ক্লাসে উপস্থিতি, লেট এবং ছুটির রিয়েল-টাইম হিসাব এখানে দেখা যাবে।"
    />
  );
};

export default StudentAttendance;
