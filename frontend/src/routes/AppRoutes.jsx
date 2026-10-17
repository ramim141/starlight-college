import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/public/Home';
import Login from '../pages/auth/Login';
import { ProtectedRoute } from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// স্টুডেন্ট পেজসমূহ
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentResults from '../pages/student/StudentResults';
import StudentAdmitCard from '../pages/student/StudentAdmitCard';
import StudentInvoices from '../pages/student/StudentInvoices';
import StudentIdCard from '../pages/student/StudentIdCard';
import StudentCertificates from '../pages/student/StudentCertificates';
import StudentComplaintPage from '../pages/student/StudentComplaintPage';

// শিক্ষক ও ইনচার্জ পেজসমূহ
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherMarksEntry from '../pages/teacher/TeacherMarksEntry';
import InChargeBulkAttendance from '../pages/teacher/InChargeBulkAttendance';
import InChargeAtRiskTracker from '../pages/teacher/InChargeAtRiskTracker';
import TeacherMaterialsPage from '../components/teacher/TeacherMaterialsPage';
import InChargeEnrollment from '../pages/teacher/InChargeEnrollment';
import InChargeFees from '../pages/teacher/InChargeFees';
import InChargeCallLog from '../pages/teacher/InChargeCallLog';

// নতুন শিক্ষক রিইউজেবল পেজসমূহ
import TeacherLeavesPage from '../pages/teacher/TeacherLeavesPage';
import TeacherInventoryPage from '../pages/teacher/TeacherInventoryPage';
import TeacherExamsPage from '../pages/teacher/TeacherExamsPage';
import TeacherClubsPage from '../pages/teacher/TeacherClubsPage';
import TeacherLibraryPage from '../pages/teacher/TeacherLibraryPage';
import TeacherTransportPage from '../pages/teacher/TeacherTransportPage';
import TeacherFinancePage from '../pages/teacher/TeacherFinancePage';
import TeacherRoutinePage from '../pages/teacher/TeacherRoutinePage';
import TeacherResultsPage from '../pages/teacher/TeacherResultsPage';

// প্রিন্সিপাল সুপার-অ্যাডমিন পেজসমূহ
import PrincipalDashboard from '../pages/principal/PrincipalDashboard';
import PrincipalStaff from '../pages/principal/PrincipalStaff';
import PrincipalSections from '../pages/principal/PrincipalSections';
import PrincipalExpenses from '../pages/principal/PrincipalExpenses';
import PrincipalFinance from '../pages/principal/PrincipalFinance';
import PrincipalResults from '../pages/principal/PrincipalResults';
import PrincipalSeatPlan from '../pages/principal/PrincipalSeatPlan';
import PrincipalExams from '../pages/principal/PrincipalExams';
import PrincipalBroadcast from '../pages/principal/PrincipalBroadcast';
import PrincipalCertificates from '../pages/principal/PrincipalCertificates';
import PrincipalComplaints from '../pages/principal/PrincipalComplaints';
import PrincipalLeaves from '../pages/principal/PrincipalLeaves';
import PrincipalTransport from '../pages/principal/PrincipalTransport';
import PrincipalInventory from '../pages/principal/PrincipalInventory';
import PrincipalClubs from '../pages/principal/PrincipalClubs';
import PrincipalLibrary from '../pages/principal/PrincipalLibrary';
import PrincipalAuditLogs from '../pages/principal/PrincipalAuditLogs';
import PrincipalAcademics from '../pages/principal/PrincipalAcademics';
import PrincipalStudentManagement from '../pages/principal/PrincipalStudentManagement';

// অ্যাকাউন্ট্যান্ট পেজসমূহ
import AccountantDashboard from '../pages/accountant/AccountantDashboard';
import AccountantFinancePage from '../pages/accountant/AccountantFinancePage';
import AccountantTransportPage from '../pages/accountant/AccountantTransportPage';
import AccountantInventoryPage from '../pages/accountant/AccountantInventoryPage';
import AccountantLeavesPage from '../pages/accountant/AccountantLeavesPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* পাবলিক ল্যান্ডিং ও হোমপেজ */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      
      {/* অথেনটিকেশন */}
      <Route path="/login" element={<Login />} />

      <Route element={<DashboardLayout />}>
        
        {/* প্রিন্সিপাল (Super Admin) পোর্টাল রাউটস */}
        <Route element={<ProtectedRoute allowedRoles={['PRINCIPAL']} />}>
          <Route path="/principal" element={<PrincipalDashboard />} />
          <Route path="/principal/staff" element={<PrincipalStaff />} />
          <Route path="/principal/students" element={<PrincipalStudentManagement />} />
          <Route path="/principal/academics" element={<PrincipalAcademics />} />
          <Route path="/principal/sections" element={<PrincipalSections />} />
          <Route path="/principal/exams" element={<PrincipalExams />} />
          <Route path="/principal/results" element={<PrincipalResults />} />
          <Route path="/principal/seat-plan" element={<PrincipalSeatPlan />} />
          <Route path="/principal/finance" element={<PrincipalFinance />} />
          <Route path="/principal/expenses" element={<PrincipalExpenses />} />
          <Route path="/principal/leaves" element={<PrincipalLeaves />} />
          <Route path="/principal/transport" element={<PrincipalTransport />} />
          <Route path="/principal/inventory" element={<PrincipalInventory />} />
          <Route path="/principal/clubs" element={<PrincipalClubs />} />
          <Route path="/principal/library" element={<PrincipalLibrary />} />
          <Route path="/principal/certificates" element={<PrincipalCertificates />} />
          <Route path="/principal/complaints" element={<PrincipalComplaints />} />
          <Route path="/principal/broadcast" element={<PrincipalBroadcast />} />
          <Route path="/principal/audit-logs" element={<PrincipalAuditLogs />} />
        </Route>

        {/* শিক্ষক ও ইনচার্জ পোর্টাল রাউটস */}
        <Route element={<ProtectedRoute allowedRoles={['TEACHER', 'PRINCIPAL']} />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/schedule" element={<TeacherRoutinePage />} />
          <Route path="/teacher/routine" element={<TeacherRoutinePage />} />
          <Route path="/teacher/attendance" element={<TeacherDashboard />} />
          <Route path="/teacher/marks" element={<TeacherMarksEntry />} />
          <Route path="/teacher/materials" element={<TeacherMaterialsPage />} />
          <Route path="/teacher/leave" element={<TeacherLeavesPage />} />
          <Route path="/teacher/leaves" element={<TeacherLeavesPage />} />
          <Route path="/teacher/inventory" element={<TeacherInventoryPage />} />
          <Route path="/teacher/exams" element={<TeacherExamsPage />} />
          <Route path="/teacher/results" element={<TeacherResultsPage />} />
          <Route path="/teacher/clubs" element={<TeacherClubsPage />} />
          <Route path="/teacher/library" element={<TeacherLibraryPage />} />
          <Route path="/teacher/transport" element={<TeacherTransportPage />} />
          <Route path="/teacher/finance" element={<TeacherFinancePage />} />
          
          {/* ইনচার্জ এক্সক্লুসিভ */}
          <Route path="/teacher/incharge/bulk-attendance" element={<InChargeBulkAttendance />} />
          <Route path="/teacher/incharge/at-risk" element={<InChargeAtRiskTracker />} />
          <Route path="/teacher/incharge/enrollment" element={<InChargeEnrollment />} />
          <Route path="/teacher/incharge/fees" element={<InChargeFees />} />
          <Route path="/teacher/incharge/call-log" element={<InChargeCallLog />} />
        </Route>

        {/* অ্যাকাউন্ট্যান্ট ও হিসাবরক্ষণ পোর্টাল রাউটস */}
        <Route element={<ProtectedRoute allowedRoles={['ACCOUNTANT', 'PRINCIPAL']} />}>
          <Route path="/accountant" element={<AccountantDashboard />} />
          <Route path="/accountant/finance" element={<AccountantFinancePage />} />
          <Route path="/accountant/transport" element={<AccountantTransportPage />} />
          <Route path="/accountant/inventory" element={<AccountantInventoryPage />} />
          <Route path="/accountant/leaves" element={<AccountantLeavesPage />} />
          <Route path="/accountant/expenses" element={<AccountantFinancePage />} />
          <Route path="/accountant/defaulters" element={<AccountantFinancePage />} />
        </Route>

        {/* স্টুডেন্ট পোর্টাল রাউটস */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/results" element={<StudentResults />} />
          <Route path="/student/admit-card" element={<StudentAdmitCard />} />
          <Route path="/student/invoices" element={<StudentInvoices />} />
          <Route path="/student/id-card" element={<StudentIdCard />} />
          <Route path="/student/certificates" element={<StudentCertificates />} />
          <Route path="/student/complaint" element={<StudentComplaintPage />} />
        </Route>

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;