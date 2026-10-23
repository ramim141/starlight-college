import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAcademicMaterials } from '../../hooks/useAcademicMaterials';
import { Filter } from 'lucide-react';
import SyllabusSection from './materials/SyllabusSection';
import HomeworkSection from './materials/HomeworkSection';
import SyllabusCompletionSection from './materials/SyllabusCompletionSection';
import UploadSyllabusModal from './materials/UploadSyllabusModal';
import PostHomeworkModal from './materials/PostHomeworkModal';

/**
 * MaterialsTab - সিলেবাস, হোমওয়ার্ক ও একাডেমিক স্টাডি রিসোর্স
 * প্রিন্সিপাল সিলেবাস কাভারেজ ড্যাশবোর্ড, সিলেবাস আপলোড ও হোমওয়ার্ক পোস্ট।
 */
const MaterialsTab = ({ overrideRole = null }) => {
  const { user, isPrincipal } = useAuth();
  const canEdit =
    (isPrincipal || overrideRole === 'PRINCIPAL') &&
    overrideRole !== 'TEACHER' &&
    user?.role !== 'TEACHER';

  const {
    syllabi,
    filteredSyllabi,
    homeworks,
    filteredHomeworks,
    subjects,
    sections,
    teachers,
    loading,
    selectedSubjectFilter,
    setSelectedSubjectFilter,
    selectedSectionFilter,
    setSelectedSectionFilter,
    uploadSyllabusModalOpen,
    setUploadSyllabusModalOpen,
    postHomeworkModalOpen,
    setPostHomeworkModalOpen,
    submitting,
    handleUploadSyllabus,
    handleDeleteSyllabus,
    handlePostHomework,
    handleDeleteHomework,
  } = useAcademicMaterials();

  if (loading && subjects.length === 0) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ১. বিষয় ও সেকশন ফিল্টার কন্ট্রোল */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-brand-orange" />
          <span className="text-xs font-bold text-brand-navy">রিসোর্স ফিল্টার:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* বিষয় অনুযায়ী ফিল্টার */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[40px]"
          >
            <option value="ALL">সকল বিষয়</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} [{s.code}]
              </option>
            ))}
          </select>

          {/* শাখা অনুযায়ী ফিল্টার */}
          <select
            value={selectedSectionFilter}
            onChange={(e) => setSelectedSectionFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[40px]"
          >
            <option value="ALL">সকল শাখা</option>
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.section_name} ({sec.class_level_display || sec.class_level})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ২. অধ্যক্ষের জন্য সিলেবাস কাভারেজ ড্যাশবোর্ড */}
      <SyllabusCompletionSection subjects={subjects} syllabi={syllabi} />

      {/* ৩. সিলেবাস ও হোমওয়ার্ক গ্রিড সেকশন */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SyllabusSection
          syllabi={filteredSyllabi}
          canEdit={canEdit}
          onOpenUploadModal={() => setUploadSyllabusModalOpen(true)}
          onDeleteSyllabus={handleDeleteSyllabus}
        />

        <HomeworkSection
          homeworks={filteredHomeworks}
          canEdit={canEdit}
          onOpenPostModal={() => setPostHomeworkModalOpen(true)}
          onDeleteHomework={handleDeleteHomework}
        />
      </div>

      {/* ৪. সিলেবাস আপলোড মডাল */}
      {canEdit && (
        <UploadSyllabusModal
          isOpen={uploadSyllabusModalOpen}
          onClose={() => setUploadSyllabusModalOpen(false)}
          onUpload={handleUploadSyllabus}
          subjects={subjects}
          submitting={submitting}
        />
      )}

      {/* ৫. হোমওয়ার্ক পোস্ট মডাল */}
      {canEdit && (
        <PostHomeworkModal
          isOpen={postHomeworkModalOpen}
          onClose={() => setPostHomeworkModalOpen(false)}
          onPost={handlePostHomework}
          sections={sections}
          subjects={subjects}
          teachers={teachers}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default MaterialsTab;