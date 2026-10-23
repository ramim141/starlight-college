import React from 'react';
import StudentPlaceholder from '../../components/student/common/StudentPlaceholder';
import { DollarSign } from 'lucide-react';

const StudentWaiver = () => {
  return (
    <StudentPlaceholder
      title="ফি মওকুফ ও ওয়েভার আবেদন"
      group="আর্থিক"
      icon={DollarSign}
      description="বিলম্ব ফি বা বিশেষ স্কলারশিপ ওয়েভারের জন্য অধ্যক্ষ বরাবর আবেদন ফরম জমা দিন।"
    />
  );
};

export default StudentWaiver;
