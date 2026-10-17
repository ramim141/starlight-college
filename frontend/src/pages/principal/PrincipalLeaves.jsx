import React from 'react';
import LeaveManagementHub from '../../components/leaves/LeaveManagementHub';

const PrincipalLeaves = () => {
  return <LeaveManagementHub overrideRole="PRINCIPAL" defaultTab="student" />;
};

export default PrincipalLeaves;
