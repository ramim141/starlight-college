import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUserApi } from '../../api/auth';
import { 
  UserCheck, 
  Shield, 
  LogOut, 
  RefreshCw,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import TemporaryPinBanner from '../../components/student/profile/TemporaryPinBanner';
import ProfileHeaderCard from '../../components/student/profile/ProfileHeaderCard';
import AcademicInfoCard from '../../components/student/profile/AcademicInfoCard';
import GuardianContactCard from '../../components/student/profile/GuardianContactCard';
import EditContactModal from '../../components/student/profile/EditContactModal';
import ChangePasswordSection from '../../components/student/profile/ChangePasswordSection';

const StudentProfile = () => {
  const { user: authUser, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('INFO'); // 'INFO' | 'SECURITY'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // লাইভ প্রোফাইল ডাটা ফেচিং
  const { data: profileResponse, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['student-profile-me'],
    queryFn: getCurrentUserApi,
    staleTime: 1000 * 60 * 5, // ৫ মিনিট ক্যাশ
  });

  const currentUser = profileResponse?.data || authUser;
  const hasTemporaryPin = Boolean(currentUser?.student_profile?.has_temporary_pin);

  const handleProfileUpdated = async () => {
    await refetch();
    if (refreshUser) {
      await refreshUser();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('সফলভাবে লগআউট সম্পন্ন হয়েছে।');
    } catch {
      toast.error('লগআউট ব্যর্থ হয়েছে।');
    }
  };

  if (isLoading && !currentUser) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-pulse">
        <div className="h-44 rounded-3xl bg-slate-100" />
        <div className="h-60 rounded-3xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* পেজ হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
            <span>আমার তথ্য</span>
            <span>•</span>
            <span className="text-brand-orange">প্রোফাইল সেটিংস</span>
          </div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight leading-snug">
            আমার প্রোফাইল ও অ্যাকাউন্ট
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            আপনার একাডেমিক পরিচয়পত্র, অভিভাবকের যোগাযোগ নম্বর এবং অ্যাকাউন্টের নিরাপত্তা সেটিংস।
          </p>
        </div>

        {/* রিফ্রেশ বাটন */}
        <button
          type="button"
          onClick={() => {
            refetch();
            toast.info('প্রোফাইল তথ্য রিলোড করা হচ্ছে...');
          }}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition shadow-xs cursor-pointer min-h-[44px] shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${isFetching ? 'animate-spin text-brand-orange' : ''}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* অস্থায়ী পিন ব্যবহারের সতর্কবার্তা ব্যানার (যদি প্রযোজ্য হয়) */}
      {hasTemporaryPin && (
        <TemporaryPinBanner onGoToSecurity={() => setActiveTab('SECURITY')} />
      )}

      {/* স্লাইডিং পিল ট্যাব নেভিগেশন */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 max-w-sm">
        <button
          type="button"
          onClick={() => setActiveTab('INFO')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
            activeTab === 'INFO'
              ? 'bg-white text-brand-navy shadow-xs border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>প্রোফাইল তথ্য</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SECURITY')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer relative ${
            activeTab === 'SECURITY'
              ? 'bg-white text-brand-navy shadow-xs border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>নিরাপত্তা ও পাসওয়ার্ড</span>
          {hasTemporaryPin && (
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping absolute top-2 right-2" />
          )}
        </button>
      </div>

      {/* ট্যাব ১: প্রোফাইল তথ্য */}
      {activeTab === 'INFO' && (
        <div className="space-y-6">
          <ProfileHeaderCard
            user={currentUser}
            onOpenEditModal={() => setIsEditModalOpen(true)}
          />

          <AcademicInfoCard user={currentUser} />

          <GuardianContactCard
            user={currentUser}
            onOpenEditModal={() => setIsEditModalOpen(true)}
          />
        </div>
      )}

      {/* ট্যাব ২: নিরাপত্তা ও পাসওয়ার্ড */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-6">
          <ChangePasswordSection
            onPasswordChanged={async () => {
              await refetch();
              if (refreshUser) {
                await refreshUser();
              }
            }}
          />

          {/* নিরাপত্তা তথ্য ও একক ডিভাইস লগআউট কার্ড */}
          <div className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-navy">অ্যাকাউন্ট সেশন ও লগআউট</h3>
                <p className="text-xs text-slate-400">এই ডিভাইসের বর্তমান সেশন সমাপ্ত করতে লগআউট করুন</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/60 flex items-start gap-3">
              <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                পাবলিক কম্পিউটার বা শেয়ার্ড ফোন ব্যবহার করলে কাজ শেষে অবশ্যই লগআউট করুন। পাসওয়ার্ড কারো সাথে শেয়ার করবেন না।
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-5 py-2.5 text-xs font-bold transition shadow-xs cursor-pointer min-h-[44px]"
              >
                <LogOut className="h-4 w-4" />
                <span>অ্যাকাউন্ট থেকে লগআউট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* যোগাযোগের তথ্য ও ছবি এডিট করার বটম-শীট মোডাল */}
      <EditContactModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={currentUser}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
};

export default StudentProfile;
