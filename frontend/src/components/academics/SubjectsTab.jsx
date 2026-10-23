import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSubjectManagement } from '../../hooks/useSubjectManagement';
import SubjectFilterBar from './subjects/SubjectFilterBar';
import SubjectTableDesktop from './subjects/SubjectTableDesktop';
import SubjectCardGridMobile from './subjects/SubjectCardGridMobile';
import SubjectCreateEditModal from './subjects/SubjectCreateEditModal';
import SubjectDeleteModal from './subjects/SubjectDeleteModal';

/**
 * SubjectsTab - পাঠ্য বিষয়সমূহের ব্যবস্থাপনা (CRUD, Search & Delete Protection)
 */
const SubjectsTab = ({ overrideRole = null }) => {
  const { user, isPrincipal } = useAuth();
  const canEdit =
    (isPrincipal || overrideRole === 'PRINCIPAL') &&
    overrideRole !== 'TEACHER' &&
    user?.role !== 'TEACHER';

  const {
    teachers,
    filteredSubjects,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    classFilter,
    setClassFilter,
    groupFilter,
    setGroupFilter,
    statusFilter,
    setStatusFilter,
    createEditModalOpen,
    setCreateEditModalOpen,
    editingSubject,
    setEditingSubject,
    deleteModalOpen,
    setDeleteModalOpen,
    deletingSubject,
    setDeletingSubject,
    submitting,
    handleSaveSubject,
    handleDeleteSubject,
  } = useSubjectManagement();

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ১. ফিল্টার ও সার্চ কন্ট্রোল */}
      <SubjectFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        classFilter={classFilter}
        setClassFilter={setClassFilter}
        groupFilter={groupFilter}
        setGroupFilter={setGroupFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        stats={stats}
        canEdit={canEdit}
        onAddNew={() => {
          setEditingSubject(null);
          setCreateEditModalOpen(true);
        }}
      />

      {/* ২. ডেস্কটপ টেবিল ভিউ */}
      <SubjectTableDesktop
        subjects={filteredSubjects}
        canEdit={canEdit}
        onEditSubject={(sub) => {
          setEditingSubject(sub);
          setCreateEditModalOpen(true);
        }}
        onDeleteSubject={(sub) => {
          setDeletingSubject(sub);
          setDeleteModalOpen(true);
        }}
      />

      {/* ৩. মোবাইল কার্ড ভিউ */}
      <SubjectCardGridMobile
        subjects={filteredSubjects}
        canEdit={canEdit}
        onEditSubject={(sub) => {
          setEditingSubject(sub);
          setCreateEditModalOpen(true);
        }}
        onDeleteSubject={(sub) => {
          setDeletingSubject(sub);
          setDeleteModalOpen(true);
        }}
      />

      {/* ৪. বিষয় তৈরি ও সম্পাদনা মডাল */}
      {canEdit && (
        <SubjectCreateEditModal
          isOpen={createEditModalOpen}
          onClose={() => {
            setCreateEditModalOpen(false);
            setEditingSubject(null);
          }}
          onSave={handleSaveSubject}
          subject={editingSubject}
          teachers={teachers}
          submitting={submitting}
        />
      )}

      {/* ৫. বিষয় মুছে ফেলার দুই ধাপের কনফার্মেশন মডাল */}
      {canEdit && (
        <SubjectDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setDeletingSubject(null);
          }}
          onConfirm={handleDeleteSubject}
          subject={deletingSubject}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default SubjectsTab;