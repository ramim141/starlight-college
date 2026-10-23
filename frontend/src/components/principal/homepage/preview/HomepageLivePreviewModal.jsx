import React, { useState } from 'react';
import { X, Smartphone, Monitor, Eye } from 'lucide-react';
import {
  HeroSection,
  ServicesSection,
  DepartmentsSection,
  AboutSection,
  AdmissionSection,
  ContactSection,
} from '../../../public/home';

const HomepageLivePreviewModal = ({
  isOpen = false,
  onClose,
  activeTab = 'hero',
  draftData = {},
  draftLists = { services: [], departments: [], steps: [], faqs: [] },
}) => {
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'mobile'

  if (!isOpen) return null;

  // ড্রাফট ডেটা প্রসেসিং (ফাইল অবজেক্ট থাকলে লোকাল অবজেক্ট ইউআরএল রূপান্তর)
  const getProcessedDraft = () => {
    switch (activeTab) {
      case 'hero': {
        const bg = draftData.background_image instanceof File
          ? URL.createObjectURL(draftData.background_image)
          : draftData.background_image;
        return { ...draftData, background_image: bg };
      }
      case 'about': {
        const photo = draftData.principal_photo instanceof File
          ? URL.createObjectURL(draftData.principal_photo)
          : draftData.principal_photo;
        return { ...draftData, principal_photo: photo };
      }
      case 'services':
        return draftLists.services || [];
      case 'departments':
        return draftLists.departments || [];
      case 'admission':
        return {
          ...draftData,
          steps: draftLists.steps || [],
          faqs: draftLists.faqs || [],
        };
      case 'contact':
        return draftData;
      default:
        return draftData;
    }
  };

  const content = getProcessedDraft();

  const renderSection = () => {
    switch (activeTab) {
      case 'hero':
        return <HeroSection content={content} />;
      case 'services':
        return <ServicesSection content={content} />;
      case 'departments':
        return <DepartmentsSection content={content} />;
      case 'about':
        return <AboutSection content={content} />;
      case 'admission':
        return <AdmissionSection content={content} />;
      case 'contact':
        return <ContactSection content={content} />;
      default:
        return (
          <div className="p-12 text-center text-slate-400">
            এই সেকশনের কোনো পাবলিক প্রিভিউ নেই।
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-3xl w-full h-[94vh] max-w-6xl shadow-2xl overflow-hidden">
        {/* প্রিভিউ টুলবার */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-orange/20 text-brand-orange border border-brand-orange/30">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                লাইভ প্রিভিউ: <span className="text-brand-orange capitalize">{activeTab}</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                পরিবর্তিত খসড়া ডেটা সরাসরি পাবলিক কম্পোনেন্টে প্রদর্শিত হচ্ছে (সেভ না করেই দৃশ্যমান)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* ডিভাইস প্রিভিউ টগল */}
            <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700">
              <button
                type="button"
                onClick={() => setDeviceMode('desktop')}
                title="ডেস্কটপ ভিউ"
                className={`flex items-center justify-center min-h-[36px] min-w-[36px] rounded-lg text-xs transition ${
                  deviceMode === 'desktop'
                    ? 'bg-brand-orange text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                title="মোবাইল ভিউ (৩৭৫ পিক্সেল)"
                className={`flex items-center justify-center min-h-[36px] min-w-[36px] rounded-lg text-xs transition ${
                  deviceMode === 'mobile'
                    ? 'bg-brand-orange text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* প্রিভিউ বডি কনটেইনার */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 flex justify-center items-start">
          <div
            className={`transition-all duration-300 bg-[#F8FAFC] text-slate-800 shadow-2xl overflow-hidden ${
              deviceMode === 'mobile'
                ? 'w-[375px] min-h-[667px] rounded-[36px] border-[8px] border-slate-800 my-4'
                : 'w-full rounded-2xl border border-slate-200'
            }`}
          >
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageLivePreviewModal;
