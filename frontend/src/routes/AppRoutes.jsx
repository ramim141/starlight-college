import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import RouteErrorBoundary from '../components/common/RouteErrorBoundary';
import HomePageSkeleton from '../components/common/HomePageSkeleton';

// পাবলিক পেজসমূহ (Lazy loaded)
const Home = lazy(() => import('../pages/public/Home'));
const Login = lazy(() => import('../pages/auth/Login'));

// স্টুডেন্ট পেজসমূহ (Lazy loaded)
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const StudentResults = lazy(() => import('../pages/student/StudentResults'));
const StudentAdmitCard = lazy(() => import('../pages/student/StudentAdmitCard'));
const StudentInvoices = lazy(() => import('../pages/student/StudentInvoices'));
const StudentIdCard = lazy(() => import('../pages/student/StudentIdCard'));
const StudentCertificates = lazy(() => import('../pages/student/StudentCertificates'));
const StudentComplaintPage = lazy(() => import('../pages/student/StudentComplaintPage'));
const StudentAttendance = lazy(() => import('../pages/student/StudentAttendance'));
const StudentRoutine = lazy(() => import('../pages/student/StudentRoutine'));
const StudentHomework = lazy(() => import('../pages/student/StudentHomework'));
const StudentTransport = lazy(() => import('../pages/student/StudentTransport'));
const StudentLibrary = lazy(() => import('../pages/student/StudentLibrary'));
const StudentLeaveApply = lazy(() => import('../pages/student/StudentLeaveApply'));
const StudentClubs = lazy(() => import('../pages/student/StudentClubs'));
const StudentNotices = lazy(() => import('../pages/student/StudentNotices'));
const StudentNotes = lazy(() => import('../pages/student/StudentNotes'));
const StudentWaiver = lazy(() => import('../pages/student/StudentWaiver'));
const StudentProfile = lazy(() => import('../pages/student/StudentProfile'));
const StudentNotifications = lazy(() => import('../pages/student/StudentNotifications'));

// শিক্ষক ও ইনচার্জ পেজসমূহ (Lazy loaded)
const TeacherDashboard = lazy(() => import('../pages/teacher/TeacherDashboard'));
const TeacherMarksEntry = lazy(() => import('../pages/teacher/TeacherMarksEntry'));
const InChargeBulkAttendance = lazy(() => import('../pages/teacher/InChargeBulkAttendance'));
const InChargeAtRiskTracker = lazy(() => import('../pages/teacher/InChargeAtRiskTracker'));
const TeacherMaterialsPage = lazy(() => import('../components/teacher/TeacherMaterialsPage'));
const InChargeEnrollment = lazy(() => import('../pages/teacher/InChargeEnrollment'));
const InChargeFees = lazy(() => import('../pages/teacher/InChargeFees'));
const InChargeCallLog = lazy(() => import('../pages/teacher/InChargeCallLog'));

// নতুন শিক্ষক রিইউজেবল পেজসমূহ (Lazy loaded)
const TeacherLeavesPage = lazy(() => import('../pages/teacher/TeacherLeavesPage'));
const TeacherInventoryPage = lazy(() => import('../pages/teacher/TeacherInventoryPage'));
const TeacherExamsPage = lazy(() => import('../pages/teacher/TeacherExamsPage'));
const TeacherClubsPage = lazy(() => import('../pages/teacher/TeacherClubsPage'));
const TeacherLibraryPage = lazy(() => import('../pages/teacher/TeacherLibraryPage'));
const TeacherTransportPage = lazy(() => import('../pages/teacher/TeacherTransportPage'));
const TeacherFinancePage = lazy(() => import('../pages/teacher/TeacherFinancePage'));
const TeacherRoutinePage = lazy(() => import('../pages/teacher/TeacherRoutinePage'));
const TeacherResultsPage = lazy(() => import('../pages/teacher/TeacherResultsPage'));

// প্রিন্সিপাল সুপার-অ্যাডমিন পেজসমূহ (Lazy loaded)
const PrincipalDashboard = lazy(() => import('../pages/principal/PrincipalDashboard'));
const PrincipalStaff = lazy(() => import('../pages/principal/PrincipalStaff'));
const PrincipalSections = lazy(() => import('../pages/principal/PrincipalSections'));
const PrincipalExpenses = lazy(() => import('../pages/principal/PrincipalExpenses'));
const PrincipalFinance = lazy(() => import('../pages/principal/PrincipalFinance'));
const PrincipalResults = lazy(() => import('../pages/principal/PrincipalResults'));
const PrincipalSeatPlan = lazy(() => import('../pages/principal/PrincipalSeatPlan'));
const PrincipalExams = lazy(() => import('../pages/principal/PrincipalExams'));
const PrincipalBroadcast = lazy(() => import('../pages/principal/PrincipalBroadcast'));
const PrincipalCertificates = lazy(() => import('../pages/principal/PrincipalCertificates'));
const PrincipalComplaints = lazy(() => import('../pages/principal/PrincipalComplaints'));
const PrincipalLeaves = lazy(() => import('../pages/principal/PrincipalLeaves'));
const PrincipalTransport = lazy(() => import('../pages/principal/PrincipalTransport'));
const PrincipalInventory = lazy(() => import('../pages/principal/PrincipalInventory'));
const PrincipalClubs = lazy(() => import('../pages/principal/PrincipalClubs'));
const PrincipalLibrary = lazy(() => import('../pages/principal/PrincipalLibrary'));
const PrincipalAuditLogs = lazy(() => import('../pages/principal/PrincipalAuditLogs'));
const PrincipalAcademics = lazy(() => import('../pages/principal/PrincipalAcademics'));
const PrincipalStudentManagement = lazy(() => import('../pages/principal/PrincipalStudentManagement'));
const PrincipalHomepageContent = lazy(() => import('../pages/principal/PrincipalHomepageContent'));
const PrincipalTeacherAttendance = lazy(() => import('../pages/principal/PrincipalTeacherAttendance'));

// অ্যাকাউন্ট্যান্ট পেজসমূহ (Lazy loaded)
const AccountantDashboard = lazy(() => import('../pages/accountant/AccountantDashboard'));
const AccountantFinancePage = lazy(() => import('../pages/accountant/AccountantFinancePage'));
const AccountantTransportPage = lazy(() => import('../pages/accountant/AccountantTransportPage'));
const AccountantInventoryPage = lazy(() => import('../pages/accountant/AccountantInventoryPage'));
const AccountantLeavesPage = lazy(() => import('../pages/accountant/AccountantLeavesPage'));

// পাসওয়ার্ড পরিবর্তন পেজ (Lazy loaded)
const ChangePassword = lazy(() => import('../pages/auth/ChangePassword'));

const AppRoutes = () => {
  return (
    <RouteErrorBoundary>
      <Routes>
        {/* পাবলিক ল্যান্ডিং ও হোমপেজ */}
        <Route
          path="/"
          element={
            <Suspense fallback={<HomePageSkeleton />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/home"
          element={
            <Suspense fallback={<HomePageSkeleton />}>
              <Home />
            </Suspense>
          }
        />

        {/* অথেনটিকেশন */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<HomePageSkeleton />}>
              <Login />
            </Suspense>
          }
        />

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
            <Route path="/principal/homepage-content" element={<PrincipalHomepageContent />} />
            <Route path="/principal/teacher-attendance" element={<PrincipalTeacherAttendance />} />
            <Route path="/principal/attendance" element={<PrincipalTeacherAttendance />} />
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
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/routine" element={<StudentRoutine />} />
            <Route path="/student/homework" element={<StudentHomework />} />
            <Route path="/student/results" element={<StudentResults />} />
            <Route path="/student/admit-card" element={<StudentAdmitCard />} />
            <Route path="/student/invoices" element={<StudentInvoices />} />
            <Route path="/student/waiver" element={<StudentWaiver />} />
            <Route path="/student/id-card" element={<StudentIdCard />} />
            <Route path="/student/transport" element={<StudentTransport />} />
            <Route path="/student/library" element={<StudentLibrary />} />
            <Route path="/student/leave-apply" element={<StudentLeaveApply />} />
            <Route path="/student/certificates" element={<StudentCertificates />} />
            <Route path="/student/clubs" element={<StudentClubs />} />
            <Route path="/student/notices" element={<StudentNotices />} />
            <Route path="/student/notes" element={<StudentNotes />} />
            <Route path="/student/complaint" element={<StudentComplaintPage />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/notifications" element={<StudentNotifications />} />
          </Route>

          {/* পাসওয়ার্ড পরিবর্তন (লগইন থাকা সকল রোলের জন্য) */}
          <Route element={<ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'STUDENT']} />}>
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RouteErrorBoundary>
  );
};

export default AppRoutes;