import PrincipalPageHero from '../PrincipalPageHero';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Globe2, 
  Eye, 
  Sparkles, 
  UserCheck, 
  Layers, 
  GraduationCap, 
  HelpCircle, 
  PhoneCall, 
  Bell, 
  RefreshCw, 
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { homepageContentApi } from '../../../api/homepage';

import HeroSectionForm from './sections/HeroSectionForm';
import AboutSectionForm from './sections/AboutSectionForm';
import ServicesSectionForm from './sections/ServicesSectionForm';
import DepartmentsSectionForm from './sections/DepartmentsSectionForm';
import AdmissionSectionForm from './sections/AdmissionSectionForm';
import ContactSectionForm from './sections/ContactSectionForm';
import InquiriesSectionTab from './sections/InquiriesSectionTab';
import NoticesSectionLink from './sections/NoticesSectionLink';
import HomepageLivePreviewModal from './preview/HomepageLivePreviewModal';

const TABS = [
  { key: 'hero', label: 'হিরো ও টিকার', icon: Sparkles },
  { key: 'about', label: 'অধ্যক্ষের বাণী', icon: UserCheck },
  { key: 'services', label: 'সার্ভিস কার্ড', icon: Layers },
  { key: 'departments', label: 'একাডেমিক বিভাগ', icon: GraduationCap },
  { key: 'admission', label: 'ভর্তি ও FAQ', icon: HelpCircle },
  { key: 'contact', label: 'যোগাযোগ তথ্য', icon: PhoneCall },
  { key: 'inquiries', label: 'ভর্তি জিজ্ঞাসা', icon: MessageSquare },
  { key: 'notices', label: 'নোটিশ বোর্ড', icon: Bell },
];

const PrincipalHomepageContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(urlTab || 'hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab, activeTab]);

  // মূল ডেটা স্টেট
  const [heroData, setHeroData] = useState({});
  const [aboutData, setAboutData] = useState({});
  const [servicesData, setServicesData] = useState([]);
  const [departmentsData, setDepartmentsData] = useState([]);
  const [admissionData, setAdmissionData] = useState({});
  const [stepsData, setStepsData] = useState([]);
  const [faqsData, setFaqsData] = useState([]);
  const [contactData, setContactData] = useState({});

  const normalize = (res) => res?.results || res || [];

  const loadAllContent = useCallback(async () => {
    setLoading(true);
    try {
      const [heroRes, aboutRes, servRes, deptRes, admRes, stepRes, faqRes, contRes] = await Promise.allSettled([
        homepageContentApi.hero.list(),
        homepageContentApi.about.list(),
        homepageContentApi.services.list(),
        homepageContentApi.departments.list(),
        homepageContentApi.admission.list(),
        homepageContentApi.steps.list(),
        homepageContentApi.faqs.list(),
        homepageContentApi.contact.list(),
      ]);

      if (heroRes.status === 'fulfilled') setHeroData(normalize(heroRes.value)[0] || {});
      if (aboutRes.status === 'fulfilled') setAboutData(normalize(aboutRes.value)[0] || {});
      if (servRes.status === 'fulfilled') setServicesData(normalize(servRes.value));
      if (deptRes.status === 'fulfilled') setDepartmentsData(normalize(deptRes.value));
      if (admRes.status === 'fulfilled') setAdmissionData(normalize(admRes.value)[0] || {});
      if (stepRes.status === 'fulfilled') setStepsData(normalize(stepRes.value));
      if (faqRes.status === 'fulfilled') setFaqsData(normalize(faqRes.value));
      if (contRes.status === 'fulfilled') setContactData(normalize(contRes.value)[0] || {});
      setIsDirty(false);
    } catch {
      toast.error('হোমপেজ তথ্য লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllContent();
  }, [loadAllContent]);

  // ট্যাব পরিবর্তনের সময় আনসেভড গার্ড
  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    if (isDirty) {
      if (!window.confirm('আপনার কিছু পরিবর্তন অসংরক্ষিত রয়েছে। আপনি কি সেভ না করেই ট্যাব পরিবর্তন করতে চান?')) {
        return;
      }
    }
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
    setIsDirty(false);
  };

  // সিঙ্গেলটন সেভ হ্যান্ডলার (hero, about, admission header, contact)
  const handleSaveSingleton = async (resource, payload, rawForm) => {
    setSaving(true);
    try {
      const currentObj = resource === 'hero' ? heroData : resource === 'about' ? aboutData : resource === 'admission' ? admissionData : contactData;
      let res;
      if (currentObj?.id) {
        res = await homepageContentApi[resource].update(currentObj.id, payload);
      } else {
        res = await homepageContentApi[resource].create(payload);
      }
      toast.success('সেকশনের তথ্য সফলভাবে সংরক্ষিত হয়েছে');
      if (resource === 'hero') setHeroData({ ...currentObj, ...rawForm, ...(res?.id ? res : {}) });
      if (resource === 'about') setAboutData({ ...currentObj, ...rawForm, ...(res?.id ? res : {}) });
      if (resource === 'admission') setAdmissionData({ ...currentObj, ...rawForm, ...(res?.id ? res : {}) });
      if (resource === 'contact') setContactData({ ...currentObj, ...rawForm, ...(res?.id ? res : {}) });
      setIsDirty(false);
    } catch {
      toast.error('সংরক্ষণ ব্যর্থ হয়েছে, পুনরায় চেষ্টা করুন');
    } finally {
      setSaving(false);
    }
  };

  // লিস্ট আইটেম সেভ ও ডিলিট
  const handleSaveListItem = async (resource, payload, id = null) => {
    setSaving(true);
    try {
      if (id) {
        await homepageContentApi[resource].update(id, payload);
      } else {
        await homepageContentApi[resource].create(payload);
      }
      toast.success('আইটেম সফলভাবে সংরক্ষিত হয়েছে');
      loadAllContent();
      return true;
    } catch {
      toast.error('আইটেম সংরক্ষণ ব্যর্থ হয়েছে');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteListItem = async (resource, id) => {
    try {
      await homepageContentApi[resource].remove(id);
      toast.success('আইটেমটি সফলভাবে মুছে ফেলা হয়েছে');
      loadAllContent();
    } catch {
      toast.error('আইটেম মোছা ব্যর্থ হয়েছে');
    }
  };

  // অপটিমিস্টিক রিঅর্ডার হ্যান্ডলার
  const handleReorder = async (resource, newOrderList) => {
    const previousState = resource === 'services' ? servicesData : resource === 'departments' ? departmentsData : resource === 'steps' ? stepsData : faqsData;
    const setter = resource === 'services' ? setServicesData : resource === 'departments' ? setDepartmentsData : resource === 'steps' ? setStepsData : setFaqsData;

    setter(newOrderList);
    try {
      await Promise.all(
        newOrderList.map((item, idx) =>
          homepageContentApi[resource].update(item.id, { display_order: idx })
        )
      );
      toast.success('ক্রম পরিবর্তিত হয়েছে');
    } catch {
      setter(previousState);
      toast.error('ক্রম পরিবর্তন ব্যর্থ হয়েছে, পূর্ববর্তী অবস্থায় ফিরে যাওয়া হয়েছে');
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 sm:space-y-6">
      <PrincipalPageHero
        icon={Globe2}
        eyebrow="ওয়েবসাইট কন্টেন্ট ম্যানেজমেন্ট"
        title="পাবলিক হোমপেজ কন্টেন্ট"
        englishTitle="Website CMS"
        description="কলেজের মূল ওয়েবসাইটের ব্যানার, তথ্য, বিভাগ ও ভর্তি নির্দেশিকা পরিচালনা করুন।"
      >
        <button type="button" onClick={() => setShowPreview(true)} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange motion-reduce:transform-none motion-reduce:transition-none">
          <Eye className="h-4 w-4 text-brand-orange" /><span>লাইভ প্রিভিউ</span>
        </button>
        <button type="button" onClick={loadAllContent} disabled={loading} title="রিফ্রেশ করুন" aria-label="রিফ্রেশ করুন" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange disabled:opacity-60 motion-reduce:transform-none motion-reduce:transition-none">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </PrincipalPageHero>
      {/* স্টিকি ট্যাব বার */}
      <div role="tablist" aria-label="হোমপেজ কন্টেন্ট বিভাগ" className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm scrollbar-thin">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(t.key)}
              className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-orange text-white shadow-md'
                  : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* সক্রিয় সেকশন ফর্ম */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
        {loading ? (
          <div className="grid min-h-[320px] content-start gap-5 py-3 animate-pulse sm:grid-cols-2">
            <div className="h-4 w-48 rounded-full bg-slate-200 sm:col-span-2" />
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-24 rounded-2xl bg-slate-100 sm:col-span-2" />
          </div>
        ) : (
          <div key={activeTab} data-tab-panel="true">
            {activeTab === 'hero' && (
              <HeroSectionForm
                data={heroData}
                saving={saving}
                onSave={handleSaveSingleton}
                onMarkDirty={() => setIsDirty(true)}
              />
            )}
            {activeTab === 'about' && (
              <AboutSectionForm
                data={aboutData}
                saving={saving}
                onSave={handleSaveSingleton}
                onMarkDirty={() => setIsDirty(true)}
              />
            )}
            {activeTab === 'services' && (
              <ServicesSectionForm
                items={servicesData}
                saving={saving}
                onSaveItem={handleSaveListItem}
                onDeleteItem={handleDeleteListItem}
                onReorderItems={handleReorder}
              />
            )}
            {activeTab === 'departments' && (
              <DepartmentsSectionForm
                items={departmentsData}
                saving={saving}
                onSaveItem={handleSaveListItem}
                onDeleteItem={handleDeleteListItem}
                onReorderItems={handleReorder}
              />
            )}
            {activeTab === 'admission' && (
              <AdmissionSectionForm
                data={admissionData}
                steps={stepsData}
                faqs={faqsData}
                saving={saving}
                onSaveHeader={handleSaveSingleton}
                onSaveStep={(p, id) => handleSaveListItem('steps', p, id)}
                onDeleteStep={(id) => handleDeleteListItem('steps', id)}
                onReorderSteps={(l) => handleReorder('steps', l)}
                onSaveFaq={(p, id) => handleSaveListItem('faqs', p, id)}
                onDeleteFaq={(id) => handleDeleteListItem('faqs', id)}
                onReorderFaqs={(l) => handleReorder('faqs', l)}
                onMarkDirty={() => setIsDirty(true)}
              />
            )}
            {activeTab === 'contact' && (
              <ContactSectionForm
                data={contactData}
                saving={saving}
                onSave={handleSaveSingleton}
                onMarkDirty={() => setIsDirty(true)}
              />
            )}
            {activeTab === 'inquiries' && <InquiriesSectionTab />}
            {activeTab === 'notices' && <NoticesSectionLink />}
          </div>
        )}
      </div>

      {/* লাইভ প্রিভিউ ড্রয়ার মোডাল */}
      <HomepageLivePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        activeTab={activeTab}
        draftData={
          activeTab === 'hero'
            ? heroData
            : activeTab === 'about'
            ? aboutData
            : activeTab === 'admission'
            ? admissionData
            : contactData
        }
        draftLists={{
          services: servicesData,
          departments: departmentsData,
          steps: stepsData,
          faqs: faqsData,
        }}
      />
    </div>
  );
};

export default PrincipalHomepageContent;




